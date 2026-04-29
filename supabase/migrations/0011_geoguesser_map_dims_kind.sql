-- ATFR — GeoGuesser : dimensions séparées width_m / height_m + type de
-- map. Le côté unique `size_m` reste pour rétro-compat ; l'admin et le
-- scoring utilisent dorénavant width_m × height_m (la map peut ne pas
-- être strictement carrée).

alter table public.wot_maps
  add column if not exists width_m  integer not null default 1000
    check (width_m between 100 and 5000),
  add column if not exists height_m integer not null default 1000
    check (height_m between 100 and 5000),
  add column if not exists kind     text    not null default 'standard';

-- Pour les maps déjà importées avec un size_m custom, on le copie dans
-- width_m / height_m s'ils sont encore au défaut.
update public.wot_maps
   set width_m  = size_m,
       height_m = size_m
 where size_m is not null
   and width_m  = 1000
   and height_m = 1000
   and size_m  <> 1000;
