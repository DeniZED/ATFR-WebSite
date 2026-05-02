-- ATFR - GeoGuesseur : reglages admin des modes et minimums de maps.
--
-- A executer dans le SQL Editor Supabase apres 0017_home_sections_content.sql.

alter table public.geoguesser_settings
  add column if not exists random_rounds integer not null default 5
    check (random_rounds between 1 and 20),
  add column if not exists sprint_rounds integer not null default 10
    check (sprint_rounds between 1 and 30),
  add column if not exists sprint_round_time_s integer not null default 20
    check (sprint_round_time_s between 5 and 120),
  add column if not exists sprint_time_penalty_m integer not null default 12
    check (sprint_time_penalty_m between 0 and 1000),
  add column if not exists blind_rounds integer not null default 5
    check (blind_rounds between 1 and 20),
  add column if not exists blind_preview_seconds integer not null default 5
    check (blind_preview_seconds between 1 and 60),
  add column if not exists min_maps_daily integer not null default 5
    check (min_maps_daily between 1 and 100),
  add column if not exists min_maps_random integer not null default 5
    check (min_maps_random between 1 and 100),
  add column if not exists min_maps_sprint integer not null default 10
    check (min_maps_sprint between 1 and 100),
  add column if not exists min_maps_blind integer not null default 5
    check (min_maps_blind between 1 and 100);

comment on column public.geoguesser_settings.random_rounds is
  'Nombre de screenshots joues en serie libre GeoGuesseur.';
comment on column public.geoguesser_settings.sprint_rounds is
  'Nombre de screenshots joues en mode Sprint GeoGuesseur.';
comment on column public.geoguesser_settings.sprint_round_time_s is
  'Timer par manche du mode Sprint GeoGuesseur, en secondes.';
comment on column public.geoguesser_settings.sprint_time_penalty_m is
  'Penalite ajoutee au score Sprint par seconde ecoulee sur une bonne map.';
comment on column public.geoguesser_settings.blind_rounds is
  'Nombre de screenshots joues en mode Blind Guess GeoGuesseur.';
comment on column public.geoguesser_settings.blind_preview_seconds is
  'Duree de visibilite du screenshot en mode Blind Guess, en secondes.';
comment on column public.geoguesser_settings.min_maps_daily is
  'Minimum de maps distinctes requis pour activer une difficulte en defi du jour.';
comment on column public.geoguesser_settings.min_maps_random is
  'Minimum de maps distinctes requis pour activer une difficulte en serie libre.';
comment on column public.geoguesser_settings.min_maps_sprint is
  'Minimum de maps distinctes requis pour activer une difficulte en Sprint.';
comment on column public.geoguesser_settings.min_maps_blind is
  'Minimum de maps distinctes requis pour activer une difficulte en Blind Guess.';
