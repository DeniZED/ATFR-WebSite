-- ATFR - Module RH / gestion joueurs.
--
-- A executer dans le SQL Editor Supabase apres 0018_geoguesser_mode_settings.sql.
-- Le module reste reserve aux utilisateurs authentifies cote admin.

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  nickname text not null,
  account_id bigint unique,
  current_clan_id bigint,
  current_clan_tag text,
  internal_role text,
  joined_at timestamptz,

  status text not null default 'prospect'
    check (status in (
      'active',
      'low_activity',
      'inactive',
      'former',
      'prospect',
      'watch'
    )),

  tags text[] not null default '{}',
  staff_comment text,
  tomato_url text,
  wot_profile_url text,
  last_wot_activity_at timestamptz,
  last_discord_voice_at timestamptz,
  source text not null default 'manual'
    check (source in ('manual', 'member_sync', 'bot', 'api')),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists players_nickname_idx
  on public.players using gin (to_tsvector('simple', nickname));
create index if not exists players_status_idx on public.players(status);
create index if not exists players_clan_idx on public.players(current_clan_tag);
create index if not exists players_discord_voice_idx
  on public.players(last_discord_voice_at desc);
create index if not exists players_wot_activity_idx
  on public.players(last_wot_activity_at desc);

create table if not exists public.player_discord_links (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  discord_user_id text not null,
  discord_tag text,
  discord_role text,
  guild_id text,
  is_primary boolean not null default true,
  linked_at timestamptz not null default now(),
  linked_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists player_discord_links_player_idx
  on public.player_discord_links(player_id);
create index if not exists player_discord_links_discord_idx
  on public.player_discord_links(discord_user_id);
create unique index if not exists player_discord_links_primary_discord_uidx
  on public.player_discord_links(discord_user_id)
  where is_primary;
create unique index if not exists player_discord_links_primary_player_uidx
  on public.player_discord_links(player_id)
  where is_primary;

create table if not exists public.player_activity_snapshots (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  account_id bigint,
  snapshot_date date not null default current_date,
  captured_at timestamptz not null default now(),
  clan_id bigint,
  clan_tag text,
  last_battle_at timestamptz,
  battles integer check (battles is null or battles >= 0),
  battles_delta integer,
  active_day boolean not null default false,
  source text not null default 'api'
    check (source in ('manual', 'bot', 'api', 'import')),
  meta jsonb not null default '{}'::jsonb,
  unique (player_id, snapshot_date)
);

create index if not exists player_activity_snapshots_player_date_idx
  on public.player_activity_snapshots(player_id, snapshot_date desc);
create index if not exists player_activity_snapshots_account_idx
  on public.player_activity_snapshots(account_id, snapshot_date desc);
create index if not exists player_activity_snapshots_last_battle_idx
  on public.player_activity_snapshots(last_battle_at desc);

create table if not exists public.discord_voice_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete set null,
  discord_user_id text not null,
  guild_id text,
  channel_id text not null,
  channel_name text,
  joined_at timestamptz not null,
  left_at timestamptz,
  duration_seconds integer not null default 0
    check (duration_seconds >= 0),
  source text not null default 'bot'
    check (source in ('bot', 'manual', 'import')),
  meta jsonb not null default '{}'::jsonb
);

create index if not exists discord_voice_sessions_player_date_idx
  on public.discord_voice_sessions(player_id, joined_at desc);
create index if not exists discord_voice_sessions_discord_date_idx
  on public.discord_voice_sessions(discord_user_id, joined_at desc);
create index if not exists discord_voice_sessions_channel_date_idx
  on public.discord_voice_sessions(channel_id, joined_at desc);
create index if not exists discord_voice_sessions_guild_idx
  on public.discord_voice_sessions(guild_id);

create table if not exists public.player_staff_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  author_id uuid references auth.users(id) on delete set null,
  note_type text not null default 'info'
    check (note_type in (
      'info',
      'warning',
      'recruitment',
      'absence',
      'behavior',
      'other'
    )),
  content text not null check (length(content) between 1 and 4000)
);

create index if not exists player_staff_notes_player_date_idx
  on public.player_staff_notes(player_id, created_at desc);
create index if not exists player_staff_notes_type_idx
  on public.player_staff_notes(note_type);

create table if not exists public.player_status_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  changed_at timestamptz not null default now(),
  author_id uuid references auth.users(id) on delete set null,
  old_status text check (
    old_status is null or old_status in (
      'active',
      'low_activity',
      'inactive',
      'former',
      'prospect',
      'watch'
    )
  ),
  new_status text check (
    new_status is null or new_status in (
      'active',
      'low_activity',
      'inactive',
      'former',
      'prospect',
      'watch'
    )
  ),
  old_role text,
  new_role text,
  note text
);

create index if not exists player_status_history_player_date_idx
  on public.player_status_history(player_id, changed_at desc);

create table if not exists public.player_alerts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  kind text not null
    check (kind in (
      'inactive',
      'no_discord',
      'no_wot',
      'game_no_voice',
      'voice_no_clan',
      'activity_drop',
      'watch',
      'custom'
    )),
  severity text not null default 'warning'
    check (severity in ('info', 'warning', 'danger')),
  title text not null,
  description text,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists player_alerts_player_active_idx
  on public.player_alerts(player_id, detected_at desc)
  where resolved_at is null;
create index if not exists player_alerts_kind_idx on public.player_alerts(kind);

drop trigger if exists players_set_updated_at on public.players;
create trigger players_set_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();

drop trigger if exists player_discord_links_set_updated_at
  on public.player_discord_links;
create trigger player_discord_links_set_updated_at
  before update on public.player_discord_links
  for each row execute function public.set_updated_at();

alter table public.players enable row level security;
alter table public.player_discord_links enable row level security;
alter table public.player_activity_snapshots enable row level security;
alter table public.discord_voice_sessions enable row level security;
alter table public.player_staff_notes enable row level security;
alter table public.player_status_history enable row level security;
alter table public.player_alerts enable row level security;

drop policy if exists "auth can manage players" on public.players;
create policy "auth can manage players"
  on public.players for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "auth can manage player discord links"
  on public.player_discord_links;
create policy "auth can manage player discord links"
  on public.player_discord_links for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "auth can manage player activity snapshots"
  on public.player_activity_snapshots;
create policy "auth can manage player activity snapshots"
  on public.player_activity_snapshots for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "auth can manage discord voice sessions"
  on public.discord_voice_sessions;
create policy "auth can manage discord voice sessions"
  on public.discord_voice_sessions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "auth can manage player staff notes"
  on public.player_staff_notes;
create policy "auth can manage player staff notes"
  on public.player_staff_notes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "auth can manage player status history"
  on public.player_status_history;
create policy "auth can manage player status history"
  on public.player_status_history for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "auth can manage player alerts" on public.player_alerts;
create policy "auth can manage player alerts"
  on public.player_alerts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
