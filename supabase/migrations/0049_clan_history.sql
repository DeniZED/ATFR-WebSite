-- Notre Histoire : jalons de la chronologie du clan affichés sur la home.
-- Même modèle de contenu public que highlights/achievements (lecture anon
-- limitée au visible, écriture réservée aux éditeurs authentifiés).

create table if not exists public.clan_history (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  year         text not null,               -- ex "2020"
  title        text not null,               -- ex "Création du clan"
  description  text,
  icon         text,                        -- nom d'icône lucide (ex "shield")
  image_url    text,
  sort_order   integer not null default 0,
  is_visible   boolean not null default true
);

create index if not exists clan_history_sort_idx
  on public.clan_history(sort_order, created_at);

alter table public.clan_history enable row level security;

drop policy if exists "clan_history public read" on public.clan_history;
drop policy if exists "clan_history auth read" on public.clan_history;
drop policy if exists "clan_history write" on public.clan_history;
create policy "clan_history public read"
  on public.clan_history for select to anon using (is_visible = true);
create policy "clan_history auth read"
  on public.clan_history for select to authenticated using (true);
create policy "clan_history write"
  on public.clan_history for all to authenticated using (true) with check (true);

-- Pré-remplissage des jalons repris de l'ancien site (images à renseigner).
insert into public.clan_history (year, title, description, icon, sort_order)
values
  ('2020', 'Création du clan',
   'Fondation d''ATFR avec une vision claire : réunir l''élite des clans français, actif et respecté.',
   'shield', 0),
  ('2021', 'La naissance du clan',
   'Première apparition lors de la campagne « Front orageux ».',
   'flag', 1),
  ('2023', 'Développement',
   'Le clan atteint un second effectif — une étape importante dans notre croissance.',
   'trending-up', 2),
  ('2023', 'Croissance',
   'ATFR poursuit son développement et s''impose en campagne, et sort 21 chars récompense.',
   'star', 3),
  ('2024', 'Top 5 Français',
   'ATFR s''impose parmi les 5 meilleurs clans français.',
   'trophy', 4),
  ('2025', 'Objectif',
   'En route vers le top clan français en termes d''activité et de résultats.',
   'crown', 5)
on conflict do nothing;
