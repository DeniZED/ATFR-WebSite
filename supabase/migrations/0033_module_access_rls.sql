-- ATFR — module_access accorde désormais de vrais droits RLS, pas
-- seulement la navigation admin.
--
-- public.has_module(key) renvoie true si l'utilisateur courant a le
-- module `key` dans user_roles.module_access (cf. ADMIN_MODULES côté
-- front, src/types/database.ts). Chaque policy/role-gate ci-dessous est
-- complétée par "or public.has_module('...')" pour le module
-- correspondant, en plus du check de rôle existant.
--
-- Le module 'utilisateurs' n'est volontairement pas concerné : la
-- gestion des rôles reste strictement super_admin.

create or replace function public.has_module(module_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select module_key = any(module_access) from public.user_roles where user_id = auth.uid()),
    false
  )
$$;

grant execute on function public.has_module(text) to authenticated;

-- =======================================================================
-- candidatures
-- =======================================================================
drop policy if exists "moderator can read applications"   on public.applications;
drop policy if exists "moderator can update applications" on public.applications;
drop policy if exists "admin can delete applications"      on public.applications;

create policy "moderator can read applications"
  on public.applications for select
  to authenticated
  using (public.is_moderator() or public.has_module('candidatures'));

create policy "moderator can update applications"
  on public.applications for update
  to authenticated
  using (public.is_moderator() or public.has_module('candidatures'))
  with check (public.is_moderator() or public.has_module('candidatures'));

create policy "admin can delete applications"
  on public.applications for delete
  to authenticated
  using (public.is_admin() or public.has_module('candidatures'));

-- =======================================================================
-- evenements
-- =======================================================================
drop policy if exists "admin can write events" on public.events;
create policy "admin can write events"
  on public.events for all
  to authenticated
  using (public.is_admin() or public.has_module('evenements'))
  with check (public.is_admin() or public.has_module('evenements'));

-- =======================================================================
-- membres
-- =======================================================================
drop policy if exists "admin can write members" on public.members;
create policy "admin can write members"
  on public.members for all
  to authenticated
  using (public.is_admin() or public.has_module('membres'))
  with check (public.is_admin() or public.has_module('membres'));

drop policy if exists "admin can write history" on public.members_history;
create policy "admin can write history"
  on public.members_history for all
  to authenticated
  using (public.is_admin() or public.has_module('membres'))
  with check (public.is_admin() or public.has_module('membres'));

-- =======================================================================
-- rh (joueurs académie/HR)
-- =======================================================================
drop policy if exists "auth can manage players" on public.players;
create policy "auth can manage players"
  on public.players for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));

drop policy if exists "auth can manage player discord links" on public.player_discord_links;
create policy "auth can manage player discord links"
  on public.player_discord_links for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));

drop policy if exists "auth can manage player activity snapshots" on public.player_activity_snapshots;
create policy "auth can manage player activity snapshots"
  on public.player_activity_snapshots for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));

drop policy if exists "auth can manage discord voice sessions" on public.discord_voice_sessions;
create policy "auth can manage discord voice sessions"
  on public.discord_voice_sessions for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));

drop policy if exists "auth can manage player staff notes" on public.player_staff_notes;
create policy "auth can manage player staff notes"
  on public.player_staff_notes for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));

drop policy if exists "auth can manage player status history" on public.player_status_history;
create policy "auth can manage player status history"
  on public.player_status_history for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));

drop policy if exists "auth can manage player alerts" on public.player_alerts;
create policy "auth can manage player alerts"
  on public.player_alerts for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));

drop policy if exists "auth can manage discord guild members" on public.discord_guild_members;
create policy "auth can manage discord guild members"
  on public.discord_guild_members for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));

drop policy if exists "auth can manage player tracking settings" on public.player_tracking_settings;
create policy "auth can manage player tracking settings"
  on public.player_tracking_settings for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));

-- =======================================================================
-- contenu (textes du site)
-- =======================================================================
drop policy if exists "editor can write site_content" on public.site_content;
create policy "editor can write site_content"
  on public.site_content for all
  to authenticated
  using (public.is_editor() or public.has_module('contenu'))
  with check (public.is_editor() or public.has_module('contenu'));

-- =======================================================================
-- galerie (médias)
-- =======================================================================
drop policy if exists "editor can write media_assets" on public.media_assets;
create policy "editor can write media_assets"
  on public.media_assets for all
  to authenticated
  using (public.is_editor() or public.has_module('galerie'))
  with check (public.is_editor() or public.has_module('galerie'));

drop policy if exists "editor can read all media_assets" on public.media_assets;
create policy "editor can read all media_assets"
  on public.media_assets for select
  to authenticated
  using (public.is_editor() or public.has_module('galerie'));

drop policy if exists "public-media insert" on storage.objects;
drop policy if exists "public-media update" on storage.objects;
drop policy if exists "public-media delete" on storage.objects;

create policy "public-media insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'public-media' and (public.is_editor() or public.has_module('galerie')));

create policy "public-media update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'public-media' and (public.is_editor() or public.has_module('galerie')))
  with check (bucket_id = 'public-media' and (public.is_editor() or public.has_module('galerie')));

create policy "public-media delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'public-media' and (public.is_editor() or public.has_module('galerie')));

-- =======================================================================
-- moments (highlights)
-- =======================================================================
drop policy if exists "editor can write highlights"     on public.highlights;
drop policy if exists "editor can read all highlights"   on public.highlights;
create policy "editor can write highlights"
  on public.highlights for all
  to authenticated
  using (public.is_editor() or public.has_module('moments'))
  with check (public.is_editor() or public.has_module('moments'));
create policy "editor can read all highlights"
  on public.highlights for select
  to authenticated
  using (public.is_editor() or public.has_module('moments'));

-- =======================================================================
-- palmares (achievements)
-- =======================================================================
drop policy if exists "editor can write achievements"   on public.achievements;
drop policy if exists "editor can read all achievements" on public.achievements;
create policy "editor can write achievements"
  on public.achievements for all
  to authenticated
  using (public.is_editor() or public.has_module('palmares'))
  with check (public.is_editor() or public.has_module('palmares'));
create policy "editor can read all achievements"
  on public.achievements for select
  to authenticated
  using (public.is_editor() or public.has_module('palmares'));

-- =======================================================================
-- temoignages (testimonials)
-- =======================================================================
drop policy if exists "editor can write testimonials"   on public.testimonials;
drop policy if exists "editor can read all testimonials" on public.testimonials;
create policy "editor can write testimonials"
  on public.testimonials for all
  to authenticated
  using (public.is_editor() or public.has_module('temoignages'))
  with check (public.is_editor() or public.has_module('temoignages'));
create policy "editor can read all testimonials"
  on public.testimonials for select
  to authenticated
  using (public.is_editor() or public.has_module('temoignages'));

-- =======================================================================
-- modules (Académie — learning_modules)
-- =======================================================================
drop policy if exists "modules write" on public.learning_modules;
create policy "modules write"
  on public.learning_modules for all
  to authenticated
  using (public.is_editor() or public.has_module('modules'))
  with check (public.is_editor() or public.has_module('modules'));

-- =======================================================================
-- academie (scores/leaderboard module_scores)
-- =======================================================================
drop policy if exists "module_scores moderate" on public.module_scores;
create policy "module_scores moderate"
  on public.module_scores for delete
  to authenticated
  using (public.is_moderator() or public.has_module('academie'));

-- =======================================================================
-- quiz
-- =======================================================================
drop policy if exists "quiz_categories write" on public.quiz_categories;
create policy "quiz_categories write"
  on public.quiz_categories for all to authenticated
  using (public.is_editor() or public.has_module('quiz'))
  with check (public.is_editor() or public.has_module('quiz'));

drop policy if exists "quiz_questions write" on public.quiz_questions;
create policy "quiz_questions write"
  on public.quiz_questions for all to authenticated
  using (public.is_editor() or public.has_module('quiz'))
  with check (public.is_editor() or public.has_module('quiz'));

drop policy if exists "quiz_answers write" on public.quiz_answers;
create policy "quiz_answers write"
  on public.quiz_answers for all to authenticated
  using (public.is_editor() or public.has_module('quiz'))
  with check (public.is_editor() or public.has_module('quiz'));

drop policy if exists "quiz_sessions read auth" on public.quiz_sessions;
create policy "quiz_sessions read auth"
  on public.quiz_sessions for select to authenticated
  using (public.is_editor() or public.has_module('quiz'));

drop policy if exists "quiz_sessions update own" on public.quiz_sessions;
create policy "quiz_sessions update own"
  on public.quiz_sessions for update
  to authenticated
  using (user_id = auth.uid() or public.is_editor() or public.has_module('quiz'))
  with check (user_id = auth.uid() or public.is_editor() or public.has_module('quiz'));

drop policy if exists "quiz_session_answers read" on public.quiz_session_answers;
create policy "quiz_session_answers read"
  on public.quiz_session_answers for select to authenticated
  using (public.is_editor() or public.has_module('quiz'));

-- =======================================================================
-- geoguesser
-- =======================================================================
drop policy if exists "wot_maps write" on public.wot_maps;
create policy "wot_maps write"
  on public.wot_maps for all to authenticated
  using (public.is_editor() or public.has_module('geoguesser'))
  with check (public.is_editor() or public.has_module('geoguesser'));

drop policy if exists "geoguesser_shots write" on public.geoguesser_shots;
create policy "geoguesser_shots write"
  on public.geoguesser_shots for all to authenticated
  using (public.is_editor() or public.has_module('geoguesser'))
  with check (public.is_editor() or public.has_module('geoguesser'));

drop policy if exists "geoguesser_settings write" on public.geoguesser_settings;
create policy "geoguesser_settings write"
  on public.geoguesser_settings for all to authenticated
  using (public.is_editor() or public.has_module('geoguesser'))
  with check (public.is_editor() or public.has_module('geoguesser'));

create or replace function public.reset_geoguesser_shot_stats(
  p_shot_id uuid
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  if not (coalesce(public.is_editor(), false) or public.has_module('geoguesser')) then
    raise exception 'not_allowed';
  end if;

  update public.geoguesser_shots
     set attempt_count = 0,
         correct_map_count = 0,
         success_score_sum = 0,
         difficulty = 'easy',
         updated_at = now()
   where id = p_shot_id;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function public.reset_geoguesser_map_stats(
  p_map_id text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  if not (coalesce(public.is_editor(), false) or public.has_module('geoguesser')) then
    raise exception 'not_allowed';
  end if;

  update public.geoguesser_shots
     set attempt_count = 0,
         correct_map_count = 0,
         success_score_sum = 0,
         difficulty = 'easy',
         updated_at = now()
   where map_id = p_map_id;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function public.reset_geoguesser_all_stats()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  if not (coalesce(public.is_editor(), false) or public.has_module('geoguesser')) then
    raise exception 'not_allowed';
  end if;

  update public.geoguesser_shots
     set attempt_count = 0,
         correct_map_count = 0,
         success_score_sum = 0,
         difficulty = 'easy',
         updated_at = now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- =======================================================================
-- pages-clan
-- =======================================================================
drop policy if exists "editor can write clan_pages" on public.clan_pages;
create policy "editor can write clan_pages"
  on public.clan_pages for all
  to authenticated
  using (public.is_editor() or public.has_module('pages-clan'))
  with check (public.is_editor() or public.has_module('pages-clan'));

-- =======================================================================
-- rh : RPC de synchronisation (import roster, statuts, Discord)
-- =======================================================================
create or replace function public.recompute_player_hr_statuses()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
begin
  if not (public.is_admin() or public.has_module('rh')) then
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
  if not (public.is_admin() or public.has_module('rh')) then
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
  if not (public.is_admin() or public.has_module('rh')) then
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
  if not (public.is_admin() or public.has_module('rh')) then
    raise exception 'Admin role required to import members into players'
      using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_members, '[]'::jsonb)) = 'array' then
    payload := coalesce(p_members, '[]'::jsonb);
  end if;
  has_payload := jsonb_array_length(payload) > 0;

  -- Sync members table if payload provided
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

  -- Mark departed members: previously synced from this clan, now absent from roster.
  -- Clearing current_clan_tag causes infer_player_hr_status() to return 'former'.
  if has_payload and nullif(p_clan_tag, '') is not null then
    update public.players
    set current_clan_tag = null,
        current_clan_id = null,
        updated_at = now()
    where source = 'member_sync'
      and current_clan_tag = p_clan_tag
      and account_id is not null
      and account_id not in (
        select (m->>'account_id')::bigint
        from jsonb_array_elements(payload) as m
        where (m->>'account_id') is not null
      );
  end if;

  perform public.recompute_player_hr_statuses();
  return affected_count;
end
$$;

