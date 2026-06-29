-- ATFR — Gestion générique des événements Clan Wars (CW).
--
-- Remplace le suivi par tableur (inscriptions, LU, dispo par soirée) par un
-- modèle réutilisable à chaque campagne :
--   cw_events        : une campagne CW (titre, période, statut)
--   cw_event_days    : les soirées de la campagne (définies par l'admin)
--   cw_registrations : inscription d'un joueur à une campagne
--   cw_availability  : dispo (oui/non) d'un inscrit pour chaque soirée
--   cw_lus           : les Line-Up de la campagne
--   cw_lu_members     : affectation d'un inscrit à une LU (titulaire/remplaçant)
--
-- Modèle de confiance identique au reste du site : les joueurs n'ont pas de
-- session Supabase Auth (identité vérifiée côté client via WG OAuth), donc
-- l'écriture sur les tables d'inscription/dispo reste ouverte à `anon`, comme
-- pour `applications`. Seules les tables de pilotage (events/days/lus/membres
-- de LU) sont réservées aux comptes Supabase Auth admin/modérateur.

create table if not exists public.cw_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed', 'archived')),
  starts_at date not null,
  ends_at date not null,
  created_by text
);

create table if not exists public.cw_event_days (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.cw_events(id) on delete cascade,
  day date not null,
  label text,
  position integer not null default 0,
  unique (event_id, day)
);

create table if not exists public.cw_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.cw_events(id) on delete cascade,
  account_id bigint,
  pseudo text not null check (length(pseudo) between 1 and 40),
  comment text check (comment is null or length(comment) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, account_id)
);

create table if not exists public.cw_availability (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.cw_registrations(id) on delete cascade,
  event_day_id uuid not null references public.cw_event_days(id) on delete cascade,
  available boolean not null default true,
  unique (registration_id, event_day_id)
);

create table if not exists public.cw_lus (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.cw_events(id) on delete cascade,
  name text not null check (length(name) between 1 and 40),
  position integer not null default 0
);

create table if not exists public.cw_lu_members (
  id uuid primary key default gen_random_uuid(),
  lu_id uuid not null references public.cw_lus(id) on delete cascade,
  registration_id uuid not null references public.cw_registrations(id) on delete cascade,
  role text not null default 'titulaire' check (role in ('titulaire', 'remplacant')),
  position integer not null default 0,
  unique (lu_id, registration_id)
);

create index if not exists cw_event_days_event_idx on public.cw_event_days (event_id);
create index if not exists cw_registrations_event_idx on public.cw_registrations (event_id);
create index if not exists cw_availability_registration_idx on public.cw_availability (registration_id);
create index if not exists cw_availability_day_idx on public.cw_availability (event_day_id);
create index if not exists cw_lus_event_idx on public.cw_lus (event_id);
create index if not exists cw_lu_members_lu_idx on public.cw_lu_members (lu_id);
create index if not exists cw_lu_members_registration_idx on public.cw_lu_members (registration_id);

alter table public.cw_events          enable row level security;
alter table public.cw_event_days      enable row level security;
alter table public.cw_registrations   enable row level security;
alter table public.cw_availability    enable row level security;
alter table public.cw_lus             enable row level security;
alter table public.cw_lu_members      enable row level security;

-- ------------------------------------------------------------------
-- cw_events / cw_event_days / cw_lus / cw_lu_members — pilotage admin,
-- lecture ouverte (la page /clan/evenements/cw est déjà protégée par
-- RequireMember côté front).
-- ------------------------------------------------------------------
drop policy if exists "anyone can read cw_events" on public.cw_events;
create policy "anyone can read cw_events"
  on public.cw_events for select
  to anon, authenticated
  using (true);

drop policy if exists "moderator can write cw_events" on public.cw_events;
create policy "moderator can write cw_events"
  on public.cw_events for all
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

drop policy if exists "anyone can read cw_event_days" on public.cw_event_days;
create policy "anyone can read cw_event_days"
  on public.cw_event_days for select
  to anon, authenticated
  using (true);

drop policy if exists "moderator can write cw_event_days" on public.cw_event_days;
create policy "moderator can write cw_event_days"
  on public.cw_event_days for all
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

drop policy if exists "anyone can read cw_lus" on public.cw_lus;
create policy "anyone can read cw_lus"
  on public.cw_lus for select
  to anon, authenticated
  using (true);

drop policy if exists "moderator can write cw_lus" on public.cw_lus;
create policy "moderator can write cw_lus"
  on public.cw_lus for all
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

drop policy if exists "anyone can read cw_lu_members" on public.cw_lu_members;
create policy "anyone can read cw_lu_members"
  on public.cw_lu_members for select
  to anon, authenticated
  using (true);

drop policy if exists "moderator can write cw_lu_members" on public.cw_lu_members;
create policy "moderator can write cw_lu_members"
  on public.cw_lu_members for all
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- ------------------------------------------------------------------
-- cw_registrations / cw_availability — un joueur s'inscrit et renseigne
-- sa dispo lui-même, sans session Supabase Auth (même modèle que les
-- candidatures de recrutement). Le staff peut tout gérer en plus.
-- ------------------------------------------------------------------
drop policy if exists "anyone can read cw_registrations" on public.cw_registrations;
create policy "anyone can read cw_registrations"
  on public.cw_registrations for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone can register to cw_events" on public.cw_registrations;
create policy "anyone can register to cw_events"
  on public.cw_registrations for insert
  to anon, authenticated
  with check (true);

drop policy if exists "anyone can update own cw_registration" on public.cw_registrations;
create policy "anyone can update own cw_registration"
  on public.cw_registrations for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "moderator can delete cw_registrations" on public.cw_registrations;
create policy "moderator can delete cw_registrations"
  on public.cw_registrations for delete
  to authenticated
  using (public.is_moderator());

drop policy if exists "anyone can read cw_availability" on public.cw_availability;
create policy "anyone can read cw_availability"
  on public.cw_availability for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone can write cw_availability" on public.cw_availability;
create policy "anyone can write cw_availability"
  on public.cw_availability for all
  to anon, authenticated
  using (true)
  with check (true);

notify pgrst, 'reload schema';
