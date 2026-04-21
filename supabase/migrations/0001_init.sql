-- ATFR clan website — initial schema.
--
-- Run this in your Supabase SQL editor (or via the Supabase CLI):
--   supabase db push
--
-- Tables:
--   applications  : candidatures (écriture anonyme, lecture réservée admin)
--   events        : événements publics du clan
--   members       : liste manuelle / synchronisée des membres
--   members_history : snapshots d'évolution
--   activity_logs : journal d'audit admin

create extension if not exists "pgcrypto";

-- =======================================================================
-- applications
-- =======================================================================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  player_name      text not null,
  account_id       bigint,
  discord_tag      text not null,
  target_clan      text not null check (target_clan in ('ATFR', 'A-T-O')),

  wn8              numeric,
  win_rate         numeric,
  battles          integer,
  tier10_count     integer,

  availability     text not null,
  motivation       text not null,
  previous_clans   text,

  status           text not null default 'pending'
                   check (status in ('pending','accepted','rejected','archived')),

  reviewed_by      uuid references auth.users(id) on delete set null,
  reviewed_at      timestamptz,
  review_notes     text
);

create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_created_at_idx on public.applications(created_at desc);

-- =======================================================================
-- events
-- =======================================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  title        text not null,
  description  text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  type         text not null check (type in
                 ('training','competition','tournament','meeting','special')),
  is_public    boolean not null default true,
  location     text,
  created_by   uuid references auth.users(id) on delete set null
);

create index if not exists events_starts_at_idx on public.events(starts_at);
create index if not exists events_is_public_idx on public.events(is_public);

-- =======================================================================
-- members
-- =======================================================================
create table if not exists public.members (
  account_id    bigint primary key,
  account_name  text not null,
  role          text not null,
  joined_at     timestamptz not null default now(),
  left_at       timestamptz,
  wn8           numeric,
  win_rate      numeric,
  battles       integer,
  global_rating integer,
  updated_at    timestamptz not null default now()
);

create index if not exists members_role_idx on public.members(role);
create index if not exists members_active_idx on public.members(left_at) where left_at is null;

-- =======================================================================
-- members_history (audit trail)
-- =======================================================================
create table if not exists public.members_history (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  account_id bigint not null,
  account_name text not null,
  action text not null check (action in ('joined','left','role_changed')),
  previous_role text,
  new_role text
);

create index if not exists members_history_account_idx on public.members_history(account_id);
create index if not exists members_history_occurred_idx on public.members_history(occurred_at desc);

-- =======================================================================
-- activity_logs (admin audit)
-- =======================================================================
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_id uuid references auth.users(id) on delete set null,
  kind text not null,
  target_id text,
  payload jsonb
);

-- =======================================================================
-- updated_at triggers
-- =======================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists members_set_updated_at on public.members;
create trigger members_set_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();
