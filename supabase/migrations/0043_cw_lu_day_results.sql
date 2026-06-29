-- ATFR — Résultats de bataille par LU et par soirée (saisie manuelle admin).
--
-- Pas de stats WoT auto (WN8/win rate joueur) : uniquement le bilan victoires/
-- défaites par LU pour chaque soirée de la campagne, saisi à la main par le
-- staff dans /admin/clan-wars. Le dashboard public agrège ces chiffres pour
-- les totaux par LU et le bilan global du clan.

create table if not exists public.cw_lu_day_results (
  id uuid primary key default gen_random_uuid(),
  event_day_id uuid not null references public.cw_event_days(id) on delete cascade,
  lu_id uuid not null references public.cw_lus(id) on delete cascade,
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  unique (event_day_id, lu_id)
);

create index if not exists cw_lu_day_results_day_idx on public.cw_lu_day_results (event_day_id);
create index if not exists cw_lu_day_results_lu_idx on public.cw_lu_day_results (lu_id);

alter table public.cw_lu_day_results enable row level security;

drop policy if exists "anyone can read cw_lu_day_results" on public.cw_lu_day_results;
create policy "anyone can read cw_lu_day_results"
  on public.cw_lu_day_results for select
  to anon, authenticated
  using (true);

drop policy if exists "moderator can write cw_lu_day_results" on public.cw_lu_day_results;
create policy "moderator can write cw_lu_day_results"
  on public.cw_lu_day_results for all
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

notify pgrst, 'reload schema';
