-- ATFR - Module RH : matching Discord et statuts automatiques.
--
-- A executer dans le SQL Editor Supabase apres 0020_hr_import_rpc_repair.sql.
-- Cette migration est idempotente et peut etre relancee.

create table if not exists public.discord_guild_members (
  discord_user_id text primary key,
  guild_id text,
  username text not null,
  display_name text,
  global_name text,
  nickname text,
  status text,
  avatar_url text,
  roles text[] not null default '{}',
  last_seen_at timestamptz not null default now(),
  source text not null default 'widget'
    check (source in ('widget', 'bot', 'manual', 'import')),
  meta jsonb not null default '{}'::jsonb
);

create index if not exists discord_guild_members_guild_idx
  on public.discord_guild_members(guild_id);
create index if not exists discord_guild_members_seen_idx
  on public.discord_guild_members(last_seen_at desc);
create index if not exists discord_guild_members_username_idx
  on public.discord_guild_members(username);

alter table public.discord_guild_members enable row level security;

drop policy if exists "auth can manage discord guild members"
  on public.discord_guild_members;
create policy "auth can manage discord guild members"
  on public.discord_guild_members for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.normalize_discord_player_name(p_value text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    regexp_replace(
      lower(coalesce(p_value, '')),
      '^[[:space:]]*[\[\(]?(atfr|a[[:space:]-]*t[[:space:]-]*o|ato)[\]\)]?[[:space:]]*[-:|]*[[:space:]]*',
      '',
      'i'
    ),
    '[^a-z0-9]+',
    '',
    'g'
  )
$$;

create or replace function public.infer_player_hr_status(p_player_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  player_record public.players%rowtype;
  latest_wot timestamptz;
  latest_voice timestamptz;
  latest_activity timestamptz;
  days_since integer;
begin
  select * into player_record
  from public.players
  where id = p_player_id;

  if not found then
    return 'prospect';
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

  if days_since <= 14 then
    return 'active';
  elsif days_since <= 45 then
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
  if not public.is_admin() then
    raise exception 'Admin role required to recompute player statuses'
      using errcode = '42501';
  end if;

  with computed as (
    select
      p.id,
      p.status as old_status,
      public.infer_player_hr_status(p.id)::text as new_status
    from public.players p
    where p.status <> 'former'
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
  )
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
  from changed;

  get diagnostics affected_count = row_count;
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
  if not public.is_admin() then
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
    'widget',
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
    roles jsonb
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
  if not public.is_admin() then
    raise exception 'Admin role required to auto-link Discord members'
      using errcode = '42501';
  end if;

  with discord_candidates as (
    select
      d.discord_user_id,
      d.guild_id,
      coalesce(
        nullif(d.display_name, ''),
        nullif(d.nickname, ''),
        nullif(d.global_name, ''),
        nullif(d.username, ''),
        d.discord_user_id
      ) as discord_name,
      public.normalize_discord_player_name(
        coalesce(
          nullif(d.display_name, ''),
          nullif(d.nickname, ''),
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
  )
  select count(*) into affected_count
  from inserted;

  return affected_count;
end
$$;

drop function if exists public.import_members_to_players(text, bigint);
drop function if exists public.import_members_to_players(text, bigint, jsonb);

create or replace function public.import_members_to_players(
  p_clan_tag text default null,
  p_clan_id bigint default null,
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
  has_payload boolean := false;
begin
  if not public.is_admin() then
    raise exception 'Admin role required to import members into players'
      using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_members, '[]'::jsonb)) = 'array' then
    payload := coalesce(p_members, '[]'::jsonb);
  end if;
  has_payload := jsonb_array_length(payload) > 0;

  if has_payload then
    insert into public.members as existing_member (
      account_id,
      account_name,
      role,
      joined_at,
      left_at,
      updated_at
    )
    select distinct on (incoming.account_id)
      incoming.account_id,
      incoming.account_name,
      coalesce(nullif(incoming.role, ''), 'member'),
      case
        when incoming.joined_at is null or incoming.joined_at <= 0
          then now()
        else to_timestamp(incoming.joined_at)
      end,
      null,
      now()
    from jsonb_to_recordset(payload) as incoming(
      account_id bigint,
      account_name text,
      role text,
      joined_at double precision
    )
    where incoming.account_id is not null
      and nullif(incoming.account_name, '') is not null
    order by incoming.account_id
    on conflict (account_id) do update
      set account_name = excluded.account_name,
          role = excluded.role,
          joined_at = coalesce(existing_member.joined_at, excluded.joined_at),
          left_at = null,
          updated_at = now();
  end if;

  with source_members as (
    select distinct on (candidate.account_id)
      candidate.account_id,
      candidate.account_name,
      candidate.role,
      candidate.joined_at
    from (
      select
        incoming.account_id,
        incoming.account_name,
        nullif(incoming.role, '') as role,
        case
          when incoming.joined_at is null or incoming.joined_at <= 0
            then now()
          else to_timestamp(incoming.joined_at)
        end as joined_at
      from jsonb_to_recordset(
        case when has_payload then payload else '[]'::jsonb end
      ) as incoming(
        account_id bigint,
        account_name text,
        role text,
        joined_at double precision
      )
      where incoming.account_id is not null
        and nullif(incoming.account_name, '') is not null

      union all

      select
        m.account_id,
        m.account_name,
        m.role,
        m.joined_at
      from public.members m
      where not has_payload
        and m.left_at is null
    ) as candidate
    order by candidate.account_id
  )
  insert into public.players as existing (
    account_id,
    nickname,
    current_clan_tag,
    current_clan_id,
    internal_role,
    joined_at,
    status,
    source,
    last_wot_activity_at,
    updated_by
  )
  select
    source_members.account_id,
    source_members.account_name,
    nullif(p_clan_tag, ''),
    p_clan_id,
    source_members.role,
    source_members.joined_at,
    'watch',
    'member_sync',
    null,
    auth.uid()
  from source_members
  on conflict (account_id) do update
    set nickname = excluded.nickname,
        current_clan_tag = excluded.current_clan_tag,
        current_clan_id = excluded.current_clan_id,
        internal_role = excluded.internal_role,
        joined_at = coalesce(existing.joined_at, excluded.joined_at),
        status = case
          when existing.status in ('former', 'prospect')
            or existing.source = 'member_sync'
            then excluded.status
          else existing.status
        end,
        source = excluded.source,
        updated_by = excluded.updated_by,
        updated_at = now();

  get diagnostics affected_count = row_count;
  perform public.recompute_player_hr_statuses();
  return affected_count;
end
$$;

grant execute on function public.upsert_discord_guild_members(text, jsonb)
  to authenticated;
grant execute on function public.auto_link_discord_members(text)
  to authenticated;
grant execute on function public.recompute_player_hr_statuses()
  to authenticated;
grant execute on function public.import_members_to_players(text, bigint, jsonb)
  to authenticated;

-- Corrige les imports precedents qui avaient classe tout le roster en actif.
update public.players p
set status = public.infer_player_hr_status(p.id)::text,
    updated_at = now()
where p.source = 'member_sync'
  and p.status in ('active', 'low_activity', 'inactive', 'watch')
  and p.status <> public.infer_player_hr_status(p.id)::text;

notify pgrst, 'reload schema';
