-- ATFR — Module GeoGuesser WoT : maps + screenshots géolocalisés.
--
-- wot_maps        : registre des maps (slug stable, source = wg|manual,
--                   image de minimap, statut actif/inactif).
-- geoguesser_shots: screenshots in-game avec position normalisée
--                   (x_pct, y_pct ∈ [0,1]) sur la minimap.
--
-- Le module pousse ses scores dans la table générique module_scores
-- (slug = 'wot-geoguesser', submode pour difficulté/mode).

-- =======================================================================
-- wot_maps
-- =======================================================================
create table if not exists public.wot_maps (
  id          text primary key,             -- slug stable, ex "12_himmelsdorf"
  name        text not null,
  description text,
  image_url   text not null,                 -- minimap (URL WG ou upload)
  width       integer,
  height      integer,
  source      text not null default 'manual'
                check (source in ('wg','manual')),
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists wot_maps_active_idx
  on public.wot_maps(is_active) where is_active = true;

drop trigger if exists wot_maps_set_updated_at on public.wot_maps;
create trigger wot_maps_set_updated_at
  before update on public.wot_maps
  for each row execute function public.set_updated_at();

-- =======================================================================
-- geoguesser_shots
-- =======================================================================
create table if not exists public.geoguesser_shots (
  id                uuid primary key default gen_random_uuid(),
  map_id            text not null references public.wot_maps(id) on delete cascade,

  image_url         text not null,
  -- Coordonnées normalisées sur la minimap (origine top-left).
  x_pct             numeric not null check (x_pct >= 0 and x_pct <= 1),
  y_pct             numeric not null check (y_pct >= 0 and y_pct <= 1),

  difficulty        text not null default 'medium'
                      check (difficulty in ('easy','medium','hard','expert')),
  caption           text,
  tags              text[] not null default '{}',

  is_published      boolean not null default false,
  sort_order        integer not null default 0,

  attempt_count     integer not null default 0,
  success_score_sum bigint  not null default 0,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references auth.users(id) on delete set null
);

create index if not exists geoguesser_shots_map_idx
  on public.geoguesser_shots(map_id);
create index if not exists geoguesser_shots_published_idx
  on public.geoguesser_shots(is_published) where is_published = true;
create index if not exists geoguesser_shots_difficulty_idx
  on public.geoguesser_shots(difficulty);
create index if not exists geoguesser_shots_tags_idx
  on public.geoguesser_shots using gin(tags);

drop trigger if exists geoguesser_shots_set_updated_at on public.geoguesser_shots;
create trigger geoguesser_shots_set_updated_at
  before update on public.geoguesser_shots
  for each row execute function public.set_updated_at();

-- =======================================================================
-- RLS
-- =======================================================================
alter table public.wot_maps          enable row level security;
alter table public.geoguesser_shots  enable row level security;

-- Maps : lecture publique des maps actives, lecture admin de tout,
-- écriture editor.
drop policy if exists "wot_maps public read"  on public.wot_maps;
drop policy if exists "wot_maps admin read"   on public.wot_maps;
drop policy if exists "wot_maps write"        on public.wot_maps;

create policy "wot_maps public read"
  on public.wot_maps for select to anon
  using (is_active = true);
create policy "wot_maps admin read"
  on public.wot_maps for select to authenticated
  using (true);
create policy "wot_maps write"
  on public.wot_maps for all to authenticated
  using (public.is_editor()) with check (public.is_editor());

-- Shots : lecture publique des shots publiés (et dont la map est active),
-- lecture admin de tout, écriture editor.
drop policy if exists "geoguesser_shots public read" on public.geoguesser_shots;
drop policy if exists "geoguesser_shots admin read"  on public.geoguesser_shots;
drop policy if exists "geoguesser_shots write"       on public.geoguesser_shots;

create policy "geoguesser_shots public read"
  on public.geoguesser_shots for select to anon
  using (
    is_published = true
    and exists (
      select 1 from public.wot_maps m
      where m.id = geoguesser_shots.map_id and m.is_active = true
    )
  );
create policy "geoguesser_shots admin read"
  on public.geoguesser_shots for select to authenticated using (true);
create policy "geoguesser_shots write"
  on public.geoguesser_shots for all to authenticated
  using (public.is_editor()) with check (public.is_editor());
