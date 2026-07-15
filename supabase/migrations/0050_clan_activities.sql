-- Notre Activité : section à onglets sur la home.
-- Les onglets Régulières / Bastion / Entraînements / Fun vivent ici ;
-- l'onglet Clan Wars réutilise la table `achievements` (Palmarès existant).

create table if not exists public.clan_activities (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  category     text not null check (category in ('regulieres','bastion','entrainements','fun')),
  title        text not null,
  badge        text,                     -- pastille ("Tous les jours !", "Tier X"…)
  description  text,
  image_url    text,
  schedule_time      text,               -- ex "21h00 – 00h00", "Variable"
  schedule_frequency text,               -- ex "Bi-hebdomadaire", "Quotidien"
  sort_order   integer not null default 0,
  is_visible   boolean not null default true
);

create index if not exists clan_activities_cat_sort_idx
  on public.clan_activities(category, sort_order, created_at);

alter table public.clan_activities enable row level security;

drop policy if exists "clan_activities public read" on public.clan_activities;
drop policy if exists "clan_activities auth read" on public.clan_activities;
drop policy if exists "clan_activities write" on public.clan_activities;
create policy "clan_activities public read"
  on public.clan_activities for select to anon using (is_visible = true);
create policy "clan_activities auth read"
  on public.clan_activities for select to authenticated using (true);
create policy "clan_activities write"
  on public.clan_activities for all to authenticated using (true) with check (true);

-- Colonnes de stats Clan Wars sur le Palmarès (pour la grille des cartes CW).
alter table public.achievements add column if not exists cw_position integer;
alter table public.achievements add column if not exists cw_battles  integer;
alter table public.achievements add column if not exists cw_tanks    integer;

-- Pré-remplissage des 12 cartes (hors Clan Wars) reprises de l'ancien site.
insert into public.clan_activities
  (category, title, badge, description, schedule_time, schedule_frequency, sort_order)
values
  ('regulieres', 'Soirées Régulières', 'Tous les jours !',
   'Soirées d''activités organisées — Incursions, Bastions, Entraînements.',
   '21h00 – 00h00', 'Bi-hebdomadaire', 0),
  ('regulieres', 'Week-end Clan', 'Samedi ou dimanche',
   'Grande soirée clan avec activités variées et moments conviviaux.',
   '21h00 – 01h00', 'Hebdomadaire', 1),
  ('regulieres', 'Farm Crédits', 'Quotidien',
   'Sessions de farm en bastions pour les crédits.',
   'Variable', 'Tous les jours', 2),

  ('bastion', 'Incursions', 'Tier X',
   'Mode 15v15 — activité phare d''ATFR, idéale pour développer un jeu collectif.',
   '21h00 – 23h00', 'Quotidien', 0),
  ('bastion', 'Jeux de Guerre', 'Tier X',
   'Incursions 15v15 ou bastions 7v7 avec stratégies avancées et coordination.',
   'Samedi soir · 22h – 01h', 'Hebdomadaire', 1),
  ('bastion', 'Bastion Farm Crédits', 'Tier VIII',
   'Perfectionnez vos compétences en 7v7 tout en farmant les crédits.',
   'Régulièrement', 'Quotidien', 2),

  ('entrainements', 'Entraînement Stratégique', 'Tier X',
   'Sessions d''entraînement en duo ou en équipe.',
   'Variable', 'Sur demande', 0),
  ('entrainements', 'Coaching Personnalisé', 'Sujets variés',
   'Séances de coaching individuel avec nos meilleurs joueurs.',
   'Variable', 'Sur demande', 1),
  ('entrainements', 'Guides variés', 'Sujets variés',
   'Une panoplie de guides à disposition sur le Discord.',
   'Variable', 'À disposition', 2),

  ('fun', 'Soirée Fun', 'Cache-cache, courses…',
   'Des soirées pour faire autre chose et passer de bons moments.',
   'Variable', 'Régulièrement', 0),
  ('fun', 'Tournois Internes', 'Tiers variables',
   'Compétitions amicales entre membres avec lots à gagner.',
   'Variable', 'Mensuel', 1),
  ('fun', 'Soirée Fun', 'Autres jeux',
   'Parties détente et amusement garanti entre membres.',
   'Variable', 'Régulièrement', 2)
on conflict do nothing;
