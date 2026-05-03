-- ATFR - Module RH : synchronisation Discord bot, vocal continu et reglages joueur.
--
-- A executer dans le SQL Editor Supabase apres 0021_hr_discord_matching.sql.
-- Cette migration est idempotente et peut etre relancee.

create table if not exists public.player_tracking_settings (
  player_id uuid primary key references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  manual_status_lock boolean not null default false,
  ignore_voice_alerts boolean not null default false,
  ignore_wot_alerts boolean not null default false,
  inactivity_warning_days integer
    check (inactivity_warning_days is null or inactivity_warning_days between 1 and 365),
  inactivity_danger_days integer
    check (inactivity_danger_days is null or inactivity_danger_days between 1 and 365),
  voice_target_minutes integer
    check (voice_target_minutes is null or voice_target_minutes >= 0),
  note text,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists player_tracking_settings_updated_idx
  on public.player_tracking_settings(updated_at desc);

drop trigger if exists player_tracking_settings_set_updated_at
  on public.player_tracking_settings;
create trigger player_tracking_settings_set_updated_at
  before update on public.player_tracking_settings
  for each row execute function public.set_updated_at();

alter table public.player_tracking_settings enable row level security;

drop policy if exists "auth can manage player tracking settings"
  on public.player_tracking_settings;
create policy "auth can manage player tracking settings"
  on public.player_tracking_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.is_admin_or_service()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or public.is_admin()
$$;

grant execute on function public.is_admin_or_service()
  to authenticated, service_role;

create or replace function public.infer_player_hr_status(p_player_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  player_record public.players%rowtype;
  tracking public.player_tracking_settings%rowtype;
  latest_wot timestamptz;
  latest_voice timestamptz;
  latest_activity timestamptz;
  days_since integer;
  active_until integer := 14;
  low_until integer := 45;
begin
  select * into player_record
  from public.players
  where id = p_player_id;

  if not found then
    return 'prospect';
  end if;

  select * into tracking
  from public.player_tracking_settings
  where player_id = p_player_id;

  if found and tracking.manual_status_lock then
    return player_record.status;
  end if;

  if found then
    active_until := coalesce(tracking.inactivity_warning_days, active_until);
    low_until := greatest(active_until, coalesce(tracking.inactivity_danger_days, low_until));
  end if;

  if player_record.current_clan_tag is null then
    if player_record.source = 'manual' then
      return 'prospect';
    end if;
    return 'former';
  end if;

  select max(coalesce(last_battle_at, captured_at)) into latest_wot
  from public.player_activity_snapshots
  where player_id = p_player_id
    and (
      active_day = true
      or coalesce(battles_delta, 0) > 0
      or last_battle_at is not null
    );

  select max(coalesce(left_at, joined_at)) into latest_voice
  from public.discord_voice_sessions
  where player_id = p_player_id;

  select max(value) into latest_activity
  from (
    values
      (player_record.last_wot_activity_at),
      (latest_wot),
      (player_record.last_discord_voice_at),
      (latest_voice)
  ) as activity(value);

  if latest_activity is null then
    return 'watch';
  end if;

  days_since := greatest(0, floor(extract(epoch from (now() - latest_activity)) / 86400)::integer);

  if days_since <= active_until then
    return 'active';
  elsif days_since <= low_until then
    return 'low_activity';
  end if;

  return 'inactive';
end
$$;

create or replace function public.recompute_player_hr_statuses()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to recompute player statuses'
      using errcode = '42501';
  end if;

  with computed as (
    select
      p.id,
      p.status as old_status,
      public.infer_player_hr_status(p.id)::text as new_status
    from public.players p
    left join public.player_tracking_settings settings
      on settings.player_id = p.id
    where coalesce(settings.manual_status_lock, false) = false
      and p.status <> 'former'
      and (
        p.source in ('member_sync', 'bot', 'api')
        or p.status in ('active', 'low_activity', 'inactive', 'watch')
      )
  ),
  changed as (
    update public.players p
    set status = computed.new_status,
        updated_at = now()
    from computed
    where p.id = computed.id
      and p.status <> computed.new_status
    returning p.id, computed.old_status, computed.new_status
  ),
  inserted_history as (
    insert into public.player_status_history (
      player_id,
      old_status,
      new_status,
      note
    )
    select
      id,
      old_status,
      new_status,
      'Recalcul automatique du statut RH'
    from changed
    returning id
  )
  select count(*) into affected_count
  from inserted_history;

  return affected_count;
end
$$;

create or replace function public.upsert_discord_guild_members(
  p_guild_id text default null,
  p_members jsonb default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
  payload jsonb := '[]'::jsonb;
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to sync Discord members'
      using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_members, '[]'::jsonb)) = 'array' then
    payload := coalesce(p_members, '[]'::jsonb);
  end if;

  insert into public.discord_guild_members as existing_member (
    discord_user_id,
    guild_id,
    username,
    display_name,
    global_name,
    nickname,
    status,
    avatar_url,
    roles,
    last_seen_at,
    source,
    meta
  )
  select distinct on (incoming.discord_user_id)
    incoming.discord_user_id,
    nullif(p_guild_id, ''),
    coalesce(nullif(incoming.username, ''), incoming.display_name, incoming.discord_user_id),
    nullif(incoming.display_name, ''),
    nullif(incoming.global_name, ''),
    nullif(incoming.nickname, ''),
    nullif(incoming.status, ''),
    nullif(incoming.avatar_url, ''),
    case
      when jsonb_typeof(incoming.roles) = 'array' then
        coalesce(
          array(select jsonb_array_elements_text(incoming.roles)),
          '{}'::text[]
        )
      else '{}'::text[]
    end,
    now(),
    case
      when incoming.source in ('widget', 'bot', 'manual', 'import')
        then incoming.source
      else 'bot'
    end,
    jsonb_strip_nulls(
      jsonb_build_object(
        'channel_id', incoming.channel_id,
        'activity', incoming.activity
      )
    )
  from jsonb_to_recordset(payload) as incoming(
    discord_user_id text,
    username text,
    display_name text,
    global_name text,
    nickname text,
    status text,
    avatar_url text,
    channel_id text,
    activity jsonb,
    roles jsonb,
    source text
  )
  where nullif(incoming.discord_user_id, '') is not null
  order by incoming.discord_user_id
  on conflict (discord_user_id) do update
    set guild_id = coalesce(excluded.guild_id, existing_member.guild_id),
        username = excluded.username,
        display_name = excluded.display_name,
        global_name = excluded.global_name,
        nickname = excluded.nickname,
        status = excluded.status,
        avatar_url = excluded.avatar_url,
        roles = excluded.roles,
        last_seen_at = now(),
        source = excluded.source,
        meta = excluded.meta;

  get diagnostics affected_count = row_count;
  return affected_count;
end
$$;

create or replace function public.auto_link_discord_members(
  p_guild_id text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to auto-link Discord members'
      using errcode = '42501';
  end if;

  with discord_candidates as (
    select
      d.discord_user_id,
      d.guild_id,
      coalesce(
        nullif(d.nickname, ''),
        nullif(d.display_name, ''),
        nullif(d.global_name, ''),
        nullif(d.username, ''),
        d.discord_user_id
      ) as discord_name,
      public.normalize_discord_player_name(
        coalesce(
          nullif(d.nickname, ''),
          nullif(d.display_name, ''),
          nullif(d.global_name, ''),
          nullif(d.username, ''),
          d.discord_user_id
        )
      ) as normalized_name
    from public.discord_guild_members d
    where p_guild_id is null
      or d.guild_id = p_guild_id
  ),
  matches as (
    select
      p.id as player_id,
      d.discord_user_id,
      d.discord_name,
      d.guild_id,
      count(*) over (partition by p.id) as player_match_count,
      count(*) over (partition by d.discord_user_id) as discord_match_count
    from public.players p
    join discord_candidates d
      on d.normalized_name = public.normalize_discord_player_name(p.nickname)
    where public.normalize_discord_player_name(p.nickname) <> ''
      and not exists (
        select 1
        from public.player_discord_links existing_link
        where existing_link.player_id = p.id
          and existing_link.is_primary = true
      )
      and not exists (
        select 1
        from public.player_discord_links existing_link
        where existing_link.discord_user_id = d.discord_user_id
          and existing_link.is_primary = true
      )
  ),
  inserted as (
    insert into public.player_discord_links (
      player_id,
      discord_user_id,
      discord_tag,
      guild_id,
      is_primary,
      linked_by
    )
    select
      player_id,
      discord_user_id,
      discord_name,
      guild_id,
      true,
      auth.uid()
    from matches
    where player_match_count = 1
      and discord_match_count = 1
    on conflict do nothing
    returning player_id, discord_user_id
  ),
  updated_voice as (
    update public.discord_voice_sessions session
    set player_id = inserted.player_id
    from inserted
    where session.player_id is null
      and session.discord_user_id = inserted.discord_user_id
    returning session.id
  ),
  touched_players as (
    update public.players p
    set last_discord_voice_at = voice.latest_voice_at,
        updated_at = now()
    from (
      select
        inserted.player_id,
        max(coalesce(session.left_at, session.joined_at)) as latest_voice_at
      from inserted
      join public.discord_voice_sessions session
        on session.discord_user_id = inserted.discord_user_id
      group by inserted.player_id
    ) voice
    where p.id = voice.player_id
      and (
        p.last_discord_voice_at is null
        or p.last_discord_voice_at < voice.latest_voice_at
      )
    returning p.id
  )
  select count(*) into affected_count
  from inserted;

  return affected_count;
end
$$;

create or replace function public.record_discord_voice_event(
  p_guild_id text default null,
  p_discord_user_id text default null,
  p_channel_id text default null,
  p_channel_name text default null,
  p_event text default 'join',
  p_occurred_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_player_id uuid;
  event_name text := lower(coalesce(p_event, 'join'));
  event_at timestamptz := coalesce(p_occurred_at, now());
  touched_session_id uuid;
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to record Discord voice events'
      using errcode = '42501';
  end if;

  if nullif(p_discord_user_id, '') is null then
    raise exception 'discord_user_id is required'
      using errcode = '22023';
  end if;

  if event_name not in ('join', 'leave', 'move') then
    raise exception 'Unsupported voice event %', event_name
      using errcode = '22023';
  end if;

  select player_id into linked_player_id
  from public.player_discord_links
  where discord_user_id = p_discord_user_id
    and is_primary = true
  limit 1;

  if event_name in ('join', 'move') and nullif(p_channel_id, '') is null then
    raise exception 'channel_id is required for join and move events'
      using errcode = '22023';
  end if;

  with closed as (
    update public.discord_voice_sessions session
    set left_at = event_at,
        duration_seconds = greatest(
          0,
          floor(extract(epoch from (event_at - session.joined_at)))::integer
        ),
        player_id = coalesce(session.player_id, linked_player_id)
    where session.discord_user_id = p_discord_user_id
      and session.left_at is null
      and (p_guild_id is null or session.guild_id = p_guild_id)
    returning session.id
  )
  select id into touched_session_id
  from closed
  limit 1;

  if event_name in ('join', 'move') then
    insert into public.discord_voice_sessions (
      player_id,
      discord_user_id,
      guild_id,
      channel_id,
      channel_name,
      joined_at,
      duration_seconds,
      source
    )
    values (
      linked_player_id,
      p_discord_user_id,
      nullif(p_guild_id, ''),
      nullif(p_channel_id, ''),
      nullif(p_channel_name, ''),
      event_at,
      0,
      'bot'
    )
    returning id into touched_session_id;
  end if;

  if linked_player_id is not null then
    update public.players
    set last_discord_voice_at = event_at,
        updated_at = now()
    where id = linked_player_id
      and (
        last_discord_voice_at is null
        or last_discord_voice_at < event_at
      );
  end if;

  return touched_session_id;
end
$$;

grant execute on function public.upsert_discord_guild_members(text, jsonb)
  to authenticated, service_role;
grant execute on function public.auto_link_discord_members(text)
  to authenticated, service_role;
grant execute on function public.recompute_player_hr_statuses()
  to authenticated, service_role;
grant execute on function public.record_discord_voice_event(text, text, text, text, text, timestamptz)
  to authenticated, service_role;

notify pgrst, 'reload schema';
