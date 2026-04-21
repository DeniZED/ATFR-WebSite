-- ATFR clan website — Row Level Security policies.
--
-- Règle générale :
--  * Les données publiques (événements publics, membres actifs) sont
--    lisibles sans authentification.
--  * Les candidatures peuvent être créées par n'importe qui (formulaire
--    de recrutement anonyme) mais seuls les admins authentifiés peuvent
--    les lire / mettre à jour.
--  * Toute écriture privilégiée nécessite un utilisateur authentifié
--    (considéré comme admin du clan).

alter table public.applications    enable row level security;
alter table public.events          enable row level security;
alter table public.members         enable row level security;
alter table public.members_history enable row level security;
alter table public.activity_logs   enable row level security;

-- ------------------------------------------------------------------
-- applications
-- ------------------------------------------------------------------
drop policy if exists "anon can submit application"  on public.applications;
drop policy if exists "auth can read applications"   on public.applications;
drop policy if exists "auth can update applications" on public.applications;
drop policy if exists "auth can delete applications" on public.applications;

create policy "anon can submit application"
  on public.applications for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and length(player_name) between 1 and 40
    and length(discord_tag) between 2 and 64
    and length(motivation) between 1 and 2000
  );

create policy "auth can read applications"
  on public.applications for select
  to authenticated
  using (true);

create policy "auth can update applications"
  on public.applications for update
  to authenticated
  using (true)
  with check (true);

create policy "auth can delete applications"
  on public.applications for delete
  to authenticated
  using (true);

-- ------------------------------------------------------------------
-- events
-- ------------------------------------------------------------------
drop policy if exists "public events are visible"  on public.events;
drop policy if exists "auth can read all events"   on public.events;
drop policy if exists "auth can write events"      on public.events;

create policy "public events are visible"
  on public.events for select
  to anon
  using (is_public = true);

create policy "auth can read all events"
  on public.events for select
  to authenticated
  using (true);

create policy "auth can write events"
  on public.events for all
  to authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------------
-- members
-- ------------------------------------------------------------------
drop policy if exists "members are public"  on public.members;
drop policy if exists "auth can write members" on public.members;

create policy "members are public"
  on public.members for select
  to anon, authenticated
  using (true);

create policy "auth can write members"
  on public.members for all
  to authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------------
-- members_history
-- ------------------------------------------------------------------
drop policy if exists "history is public" on public.members_history;
drop policy if exists "auth can write history" on public.members_history;

create policy "history is public"
  on public.members_history for select
  to anon, authenticated
  using (true);

create policy "auth can write history"
  on public.members_history for all
  to authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------------
-- activity_logs (admin-only)
-- ------------------------------------------------------------------
drop policy if exists "auth can access logs" on public.activity_logs;

create policy "auth can access logs"
  on public.activity_logs for all
  to authenticated
  using (true)
  with check (true);
