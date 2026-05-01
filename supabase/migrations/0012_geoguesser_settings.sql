-- ATFR — Geoguesser : paramètres globaux ajustables côté admin.
-- Une seule ligne (id = 1) ; pas de relation, juste de la conf.
--
--   round_time_s        : durée d'une manche (en secondes), 5..300.
--   wrong_map_malus_m   : pénalité ajoutée au score quand le joueur
--                         choisit la mauvaise map (en mètres).
--   timeout_malus_m     : pénalité quand la manche expire sans pick
--                         (en mètres).
--   target_easy_avg_m   : seuil de distance moyenne en dessous duquel
--                         un screen est jugé "trop facile" (=> bump).
--   target_hard_avg_m   : seuil au-dessus duquel un screen est jugé
--                         "trop dur" (=> easy).

create table if not exists public.geoguesser_settings (
  id                  smallint primary key check (id = 1),
  round_time_s        integer not null default 45
                        check (round_time_s between 5 and 300),
  wrong_map_malus_m   integer not null default 2000
                        check (wrong_map_malus_m between 0 and 100000),
  timeout_malus_m     integer not null default 2000
                        check (timeout_malus_m  between 0 and 100000),
  updated_at          timestamptz not null default now()
);

insert into public.geoguesser_settings (id)
values (1)
on conflict (id) do nothing;

drop trigger if exists geoguesser_settings_set_updated_at
  on public.geoguesser_settings;
create trigger geoguesser_settings_set_updated_at
  before update on public.geoguesser_settings
  for each row execute function public.set_updated_at();

alter table public.geoguesser_settings enable row level security;
drop policy if exists "geoguesser_settings read"  on public.geoguesser_settings;
drop policy if exists "geoguesser_settings write" on public.geoguesser_settings;

-- Lecture publique : le client a besoin du timer / malus pour jouer.
create policy "geoguesser_settings read"
  on public.geoguesser_settings for select
  using (true);

create policy "geoguesser_settings write"
  on public.geoguesser_settings for all to authenticated
  using (public.is_editor()) with check (public.is_editor());
