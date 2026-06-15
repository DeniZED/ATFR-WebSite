-- ATFR — Accès des pages "clan" par clan WoT autorisé.
--
-- `clan_pages` liste les zones du site réservées à certains clans WoT
-- (identifiés par leur clan_id). `allowed_clans` est un tableau jsonb
-- d'objets { clan_id, clan_tag } — le tag est purement informatif
-- (affichage admin), seul clan_id sert au contrôle d'accès.

create table if not exists public.clan_pages (
  slug          text primary key,
  title         text not null,
  description   text,
  allowed_clans jsonb not null default '[]'::jsonb,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users(id) on delete set null
);

alter table public.clan_pages enable row level security;

drop policy if exists "clan_pages public read" on public.clan_pages;
drop policy if exists "editor can write clan_pages" on public.clan_pages;

create policy "clan_pages public read"
  on public.clan_pages for select
  to anon, authenticated
  using (true);

create policy "editor can write clan_pages"
  on public.clan_pages for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

insert into public.clan_pages (slug, title, description, allowed_clans)
values (
  'clan-hub',
  'Espace clan',
  'Équipement, compétences, stratégies et liens utiles réservés aux membres du clan.',
  '[{"clan_id": 500191501, "clan_tag": "ATFR"}]'::jsonb
)
on conflict (slug) do nothing;
