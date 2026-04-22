-- ATFR — CMS : contenus éditables, médias, palmarès, témoignages.
--
-- À exécuter après 0001_init.sql et 0002_rls.sql.
-- Crée également le bucket Storage `public-media` pour les uploads.

create extension if not exists "pgcrypto";

-- =======================================================================
-- site_content : store clé/valeur pour textes éditables
-- =======================================================================
create table if not exists public.site_content (
  key         text primary key,
  value       text not null default '',
  kind        text not null default 'text'
               check (kind in ('text', 'longtext', 'url', 'image', 'video')),
  label       text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

-- Seed des clés par défaut (le public lit ces valeurs ; l'admin les édite).
insert into public.site_content (key, value, kind, label) values
  ('hero_video_url',     '',                                           'video',    'Vidéo de fond (hero)'),
  ('hero_poster_url',    '',                                           'image',    'Image poster hero (fallback)'),
  ('hero_eyebrow',       'World of Tanks — Clan FR',                   'text',     'Petit texte au-dessus du titre'),
  ('hero_title',         'LE CLAN ATFR',                               'text',     'Titre principal'),
  ('hero_subtitle',      'Compétitif, stratégique, communautaire.',    'text',     'Sous-titre hero'),
  ('hero_cta_primary',   'Nous rejoindre',                             'text',     'Bouton principal hero'),
  ('hero_cta_secondary', 'Découvrir le clan',                          'text',     'Bouton secondaire hero'),
  ('about_eyebrow',      'À propos',                                   'text',     'Surtitre section About'),
  ('about_title',        'Un clan forgé par la stratégie',             'text',     'Titre section About'),
  ('about_text',         'ATFR réunit des joueurs passionnés autour d''un objectif commun : progresser ensemble et exceller en compétition.', 'longtext', 'Texte About'),
  ('activities_eyebrow', 'Ce que nous faisons',                        'text',     'Surtitre activités'),
  ('activities_title',   'Nos activités',                              'text',     'Titre activités'),
  ('activity_1_title',   'Entraînements',                              'text',     'Activité 1 titre'),
  ('activity_1_text',    'Sessions hebdomadaires pour affiner tactiques et coordination.', 'longtext', 'Activité 1 description'),
  ('activity_1_image',   '',                                           'image',    'Activité 1 image'),
  ('activity_2_title',   'Tournois & compétitions',                    'text',     'Activité 2 titre'),
  ('activity_2_text',    'Participations régulières aux tournois officiels et communautaires.', 'longtext', 'Activité 2 description'),
  ('activity_2_image',   '',                                           'image',    'Activité 2 image'),
  ('activity_3_title',   'Événements spéciaux',                        'text',     'Activité 3 titre'),
  ('activity_3_text',    'Soirées à thème, batailles fun et streams communautaires.', 'longtext', 'Activité 3 description'),
  ('activity_3_image',   '',                                           'image',    'Activité 3 image'),
  ('cta_title',          'Prêt à rejoindre l''aventure ?',             'text',     'Titre CTA recrutement'),
  ('cta_text',           'Le clan recrute des joueurs motivés et stratégiques. Postule en 2 minutes.', 'longtext', 'Texte CTA recrutement'),
  ('highlights_eyebrow', 'Moments forts',                              'text',     'Surtitre highlights'),
  ('highlights_title',   'Nos fiertés',                                'text',     'Titre highlights'),
  ('achievements_eyebrow','Palmarès',                                  'text',     'Surtitre palmarès'),
  ('achievements_title', 'Trophées & classements',                     'text',     'Titre palmarès'),
  ('testimonials_eyebrow','Témoignages',                               'text',     'Surtitre témoignages'),
  ('testimonials_title', 'La parole aux membres',                      'text',     'Titre témoignages')
on conflict (key) do nothing;

-- =======================================================================
-- media_assets : métadonnées des fichiers uploadés dans le bucket
-- =======================================================================
create table if not exists public.media_assets (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id) on delete set null,

  path         text not null unique,       -- chemin dans le bucket Storage
  public_url   text not null,              -- URL publique construite une fois
  kind         text not null check (kind in ('image','video')),
  mime         text,
  size_bytes   bigint,
  width        integer,
  height       integer,
  caption      text,
  tags         text[] not null default '{}'
);

create index if not exists media_assets_kind_idx on public.media_assets(kind);
create index if not exists media_assets_tags_idx on public.media_assets using gin(tags);

-- =======================================================================
-- highlights : moments forts affichés sur la home
-- =======================================================================
create table if not exists public.highlights (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  title        text not null,
  description  text,
  image_url    text,
  occurred_on  date,
  sort_order   integer not null default 0,
  is_visible   boolean not null default true
);

create index if not exists highlights_sort_idx on public.highlights(sort_order, created_at desc);

-- =======================================================================
-- achievements : palmarès (trophées, classements)
-- =======================================================================
create table if not exists public.achievements (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  title        text not null,
  subtitle     text,
  description  text,
  rank         text,                       -- ex "1er", "Top 8", "Or"
  competition  text,                       -- ex "SKIRMISH mars 2026"
  earned_on    date,
  image_url    text,
  sort_order   integer not null default 0,
  is_visible   boolean not null default true
);

create index if not exists achievements_sort_idx on public.achievements(sort_order, earned_on desc nulls last);

-- =======================================================================
-- testimonials : citations de membres
-- =======================================================================
create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  author_name  text not null,
  author_role  text,                       -- ex "Commandant", "Vétéran"
  avatar_url   text,
  quote        text not null,
  sort_order   integer not null default 0,
  is_visible   boolean not null default true
);

create index if not exists testimonials_sort_idx on public.testimonials(sort_order, created_at desc);

-- =======================================================================
-- updated_at triggers
-- =======================================================================
drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

drop trigger if exists highlights_set_updated_at on public.highlights;
create trigger highlights_set_updated_at
  before update on public.highlights
  for each row execute function public.set_updated_at();

drop trigger if exists achievements_set_updated_at on public.achievements;
create trigger achievements_set_updated_at
  before update on public.achievements
  for each row execute function public.set_updated_at();

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- =======================================================================
-- RLS
-- =======================================================================
alter table public.site_content   enable row level security;
alter table public.media_assets   enable row level security;
alter table public.highlights     enable row level security;
alter table public.achievements   enable row level security;
alter table public.testimonials   enable row level security;

-- site_content : lecture publique, écriture authentifiée
drop policy if exists "site_content read" on public.site_content;
drop policy if exists "site_content write" on public.site_content;
create policy "site_content read"
  on public.site_content for select to anon, authenticated using (true);
create policy "site_content write"
  on public.site_content for all to authenticated using (true) with check (true);

-- media_assets : lecture publique, écriture authentifiée
drop policy if exists "media_assets read" on public.media_assets;
drop policy if exists "media_assets write" on public.media_assets;
create policy "media_assets read"
  on public.media_assets for select to anon, authenticated using (true);
create policy "media_assets write"
  on public.media_assets for all to authenticated using (true) with check (true);

-- highlights : lecture publique (is_visible), écriture authentifiée
drop policy if exists "highlights public read" on public.highlights;
drop policy if exists "highlights auth read" on public.highlights;
drop policy if exists "highlights write" on public.highlights;
create policy "highlights public read"
  on public.highlights for select to anon using (is_visible = true);
create policy "highlights auth read"
  on public.highlights for select to authenticated using (true);
create policy "highlights write"
  on public.highlights for all to authenticated using (true) with check (true);

-- achievements
drop policy if exists "achievements public read" on public.achievements;
drop policy if exists "achievements auth read" on public.achievements;
drop policy if exists "achievements write" on public.achievements;
create policy "achievements public read"
  on public.achievements for select to anon using (is_visible = true);
create policy "achievements auth read"
  on public.achievements for select to authenticated using (true);
create policy "achievements write"
  on public.achievements for all to authenticated using (true) with check (true);

-- testimonials
drop policy if exists "testimonials public read" on public.testimonials;
drop policy if exists "testimonials auth read" on public.testimonials;
drop policy if exists "testimonials write" on public.testimonials;
create policy "testimonials public read"
  on public.testimonials for select to anon using (is_visible = true);
create policy "testimonials auth read"
  on public.testimonials for select to authenticated using (true);
create policy "testimonials write"
  on public.testimonials for all to authenticated using (true) with check (true);

-- =======================================================================
-- Storage bucket : public-media
-- =======================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-media',
  'public-media',
  true,
  104857600, -- 100 MB
  array[
    'image/png','image/jpeg','image/webp','image/gif','image/svg+xml',
    'video/mp4','video/webm','video/quicktime'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Policies Storage : lecture publique, écriture authentifiée.
drop policy if exists "public-media read"   on storage.objects;
drop policy if exists "public-media insert" on storage.objects;
drop policy if exists "public-media update" on storage.objects;
drop policy if exists "public-media delete" on storage.objects;

create policy "public-media read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'public-media');

create policy "public-media insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'public-media');

create policy "public-media update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'public-media')
  with check (bucket_id = 'public-media');

create policy "public-media delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'public-media');
