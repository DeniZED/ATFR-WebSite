-- ATFR - Medias : separation entre assets du site et galerie publique.
--
-- A executer dans le SQL Editor Supabase apres les migrations precedentes.
-- Par defaut, un media uploade reste un asset interne du site. Les editeurs
-- choisissent explicitement ce qui apparait dans l'onglet public Galerie.

alter table public.media_assets
  add column if not exists is_gallery_visible boolean not null default false;

create index if not exists media_assets_gallery_visible_idx
  on public.media_assets(is_gallery_visible, created_at desc);

update public.media_assets
   set is_gallery_visible = true
 where tags @> array['gallery']::text[];

drop policy if exists "media_assets read" on public.media_assets;
drop policy if exists "media_assets public gallery read" on public.media_assets;
drop policy if exists "editor can read all media_assets" on public.media_assets;

create policy "media_assets public gallery read"
  on public.media_assets for select
  to anon, authenticated
  using (is_gallery_visible = true);

create policy "editor can read all media_assets"
  on public.media_assets for select
  to authenticated
  using (public.is_editor());
