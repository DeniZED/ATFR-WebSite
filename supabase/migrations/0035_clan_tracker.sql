-- ATFR — Module bot Discord : suivi des clans WoT (entrées/sorties) et
-- configuration par serveur.
--
-- A executer apres 0034_module_restrictions.sql. Idempotente.
--
-- Tables :
--   discord_bot_guild_configs : config par serveur (salon de notif, clans
--     suivis, intervalle de scan).
--   clan_roster_members       : cache du dernier roster connu par clan,
--     utilisé pour calculer les entrées/sorties au scan suivant.
--   clan_member_movements     : historique exploitable des mouvements
--     (entrée/sortie) — alimente le dashboard du site.
--
-- Fonctions (toutes restreintes via is_admin_or_service(), défini en
-- 0022_hr_discord_bot_and_player_settings.sql) :
--   upsert_discord_bot_guild_config / add_tracked_clan / remove_tracked_clan
--   sync_clan_roster — calcule le diff roster et journalise les mouvements.

create table if not exists public.discord_bot_guild_configs (
  guild_id text primary key,
  clan_notify_channel_id text,
  tracked_clans jsonb not null default '[]'::jsonb,
  scan_interval_minutes integer not null default 15
    check (scan_interval_minutes between 5 and 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

drop trigger if exists discord_bot_guild_configs_set_updated_at
  on public.discord_bot_guild_configs;
create trigger discord_bot_guild_configs_set_updated_at
  before update on public.discord_bot_guild_configs
  for each row execute function public.set_updated_at();

alter table public.discord_bot_guild_configs enable row level security;

drop policy if exists "admin can read discord bot guild configs"
  on public.discord_bot_guild_configs;
create policy "admin can read discord bot guild configs"
  on public.discord_bot_guild_configs for select
  to authenticated
  using (public.is_admin());

create table if not exists public.clan_roster_members (
  clan_id bigint not null,
  account_id bigint not null,
  account_name text not null,
  role text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (clan_id, account_id)
);

alter table public.clan_roster_members enable row level security;

drop policy if exists "admin can read clan roster members"
  on public.clan_roster_members;
create policy "admin can read clan roster members"
  on public.clan_roster_members for select
  to authenticated
  using (public.is_admin());

create table if not exists public.clan_member_movements (
  id uuid primary key default gen_random_uuid(),
  guild_id text,
  clan_id bigint not null,
  clan_tag text,
  account_id bigint not null,
  account_name text not null,
  role text,
  event text not null check (event in ('join', 'leave')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists clan_member_movements_clan_occurred_idx
  on public.clan_member_movements (clan_id, occurred_at desc);
create index if not exists clan_member_movements_guild_occurred_idx
  on public.clan_member_movements (guild_id, occurred_at desc);

alter table public.clan_member_movements enable row level security;

drop policy if exists "admin can read clan member movements"
  on public.clan_member_movements;
create policy "admin can read clan member movements"
  on public.clan_member_movements for select
  to authenticated
  using (public.is_admin());

-- ── Configuration par serveur ───────────────────────────────────────────────

create or replace function public.upsert_discord_bot_guild_config(
  p_guild_id text,
  p_clan_notify_channel_id text default null,
  p_tracked_clans jsonb default null,
  p_scan_interval_minutes integer default null,
  p_updated_by text default null
)
returns public.discord_bot_guild_configs
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.discord_bot_guild_configs;
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to update Discord bot guild config'
      using errcode = '42501';
  end if;

  if nullif(p_guild_id, '') is null then
    raise exception 'guild_id is required' using errcode = '22023';
  end if;

  if p_tracked_clans is not null and jsonb_typeof(p_tracked_clans) <> 'array' then
    raise exception 'tracked_clans must be a JSON array' using errcode = '22023';
  end if;

  insert into public.discord_bot_guild_configs as existing (
    guild_id,
    clan_notify_channel_id,
    tracked_clans,
    scan_interval_minutes,
    updated_by
  )
  values (
    p_guild_id,
    p_clan_notify_channel_id,
    coalesce(p_tracked_clans, '[]'::jsonb),
    coalesce(p_scan_interval_minutes, 15),
    p_updated_by
  )
  on conflict (guild_id) do update
    set clan_notify_channel_id = coalesce(p_clan_notify_channel_id, existing.clan_notify_channel_id),
        tracked_clans = coalesce(p_tracked_clans, existing.tracked_clans),
        scan_interval_minutes = coalesce(p_scan_interval_minutes, existing.scan_interval_minutes),
        updated_by = coalesce(p_updated_by, existing.updated_by)
  returning * into result;

  return result;
end
$$;

create or replace function public.add_tracked_clan(
  p_guild_id text,
  p_clan_id bigint,
  p_clan_tag text default null,
  p_clan_name text default null,
  p_updated_by text default null
)
returns public.discord_bot_guild_configs
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.discord_bot_guild_configs;
  new_entry jsonb;
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to add a tracked clan'
      using errcode = '42501';
  end if;

  if p_clan_id is null then
    raise exception 'clan_id is required' using errcode = '22023';
  end if;

  insert into public.discord_bot_guild_configs (guild_id, updated_by)
  values (p_guild_id, p_updated_by)
  on conflict (guild_id) do nothing;

  new_entry := jsonb_build_object(
    'clan_id', p_clan_id,
    'clan_tag', nullif(p_clan_tag, ''),
    'clan_name', nullif(p_clan_name, '')
  );

  update public.discord_bot_guild_configs
  set tracked_clans = (
        select coalesce(jsonb_agg(entry), '[]'::jsonb)
        from jsonb_array_elements(tracked_clans) entry
        where (entry->>'clan_id')::bigint <> p_clan_id
      ) || jsonb_build_array(new_entry),
      updated_by = coalesce(p_updated_by, updated_by)
  where guild_id = p_guild_id
  returning * into result;

  return result;
end
$$;

create or replace function public.remove_tracked_clan(
  p_guild_id text,
  p_clan_id bigint,
  p_updated_by text default null
)
returns public.discord_bot_guild_configs
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.discord_bot_guild_configs;
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to remove a tracked clan'
      using errcode = '42501';
  end if;

  update public.discord_bot_guild_configs
  set tracked_clans = (
        select coalesce(jsonb_agg(entry), '[]'::jsonb)
        from jsonb_array_elements(tracked_clans) entry
        where (entry->>'clan_id')::bigint <> p_clan_id
      ),
      updated_by = coalesce(p_updated_by, updated_by)
  where guild_id = p_guild_id
  returning * into result;

  -- Roster cache stale après désinscription : on la purge pour repartir
  -- d'un état propre (bootstrap silencieux) si le clan est ré-ajouté.
  delete from public.clan_roster_members where clan_id = p_clan_id;

  return result;
end
$$;

-- ── Scan de roster : calcule le diff et journalise les mouvements ──────────

create or replace function public.sync_clan_roster(
  p_guild_id text,
  p_clan_id bigint,
  p_clan_tag text,
  p_members jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  is_bootstrap boolean;
  joins jsonb := '[]'::jsonb;
  leaves jsonb := '[]'::jsonb;
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to sync clan roster'
      using errcode = '42501';
  end if;

  if p_clan_id is null then
    raise exception 'clan_id is required' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_members, '[]'::jsonb)) <> 'array' then
    raise exception 'members must be a JSON array' using errcode = '22023';
  end if;

  select not exists (
    select 1 from public.clan_roster_members where clan_id = p_clan_id
  ) into is_bootstrap;

  with incoming as (
    select
      (m->>'account_id')::bigint as account_id,
      m->>'account_name' as account_name,
      nullif(m->>'role', '') as role
    from jsonb_array_elements(coalesce(p_members, '[]'::jsonb)) m
    where nullif(m->>'account_id', '') is not null
  ),
  new_joins as (
    select incoming.* from incoming
    where not exists (
      select 1 from public.clan_roster_members r
      where r.clan_id = p_clan_id and r.account_id = incoming.account_id
    )
  ),
  gone_leaves as (
    select r.account_id, r.account_name, r.role
    from public.clan_roster_members r
    where r.clan_id = p_clan_id
      and not exists (
        select 1 from incoming where incoming.account_id = r.account_id
      )
  ),
  recorded_joins as (
    insert into public.clan_member_movements (
      guild_id, clan_id, clan_tag, account_id, account_name, role, event
    )
    select p_guild_id, p_clan_id, p_clan_tag, account_id, account_name, role, 'join'
    from new_joins
    where not is_bootstrap
    returning account_id, account_name, role
  ),
  recorded_leaves as (
    insert into public.clan_member_movements (
      guild_id, clan_id, clan_tag, account_id, account_name, role, event
    )
    select p_guild_id, p_clan_id, p_clan_tag, account_id, account_name, role, 'leave'
    from gone_leaves
    where not is_bootstrap
    returning account_id, account_name, role
  ),
  deleted_leaves as (
    delete from public.clan_roster_members r
    using gone_leaves
    where r.clan_id = p_clan_id and r.account_id = gone_leaves.account_id
    returning r.account_id
  ),
  upserted as (
    insert into public.clan_roster_members as existing (
      clan_id, account_id, account_name, role, last_seen_at
    )
    select p_clan_id, account_id, account_name, role, now()
    from incoming
    on conflict (clan_id, account_id) do update
      set account_name = excluded.account_name,
          role = excluded.role,
          last_seen_at = now()
    returning existing.account_id
  )
  select
    coalesce((select jsonb_agg(jsonb_build_object(
      'account_id', account_id, 'account_name', account_name, 'role', role
    )) from recorded_joins), '[]'::jsonb),
    coalesce((select jsonb_agg(jsonb_build_object(
      'account_id', account_id, 'account_name', account_name, 'role', role
    )) from recorded_leaves), '[]'::jsonb)
  into joins, leaves;

  return jsonb_build_object(
    'bootstrap', is_bootstrap,
    'joins', joins,
    'leaves', leaves
  );
end
$$;

grant execute on function public.upsert_discord_bot_guild_config(text, text, jsonb, integer, text)
  to authenticated, service_role;
grant execute on function public.add_tracked_clan(text, bigint, text, text, text)
  to authenticated, service_role;
grant execute on function public.remove_tracked_clan(text, bigint, text)
  to authenticated, service_role;
grant execute on function public.sync_clan_roster(text, bigint, text, jsonb)
  to authenticated, service_role;

notify pgrst, 'reload schema';
