-- ATFR — GeoGuesseur : réglage du défi du jour.
--
-- À exécuter dans le SQL Editor Supabase après 0012_geoguesser_settings.sql.
-- Le client utilise cette valeur pour tirer chaque jour la même série de
-- screenshots pour tous les joueurs.

alter table public.geoguesser_settings
  add column if not exists daily_challenge_rounds integer not null default 5
    check (daily_challenge_rounds between 1 and 20);

comment on column public.geoguesser_settings.daily_challenge_rounds is
  'Nombre de screenshots joués dans le défi du jour GeoGuesseur.';
