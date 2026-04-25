-- ATFR — Hub de modules (guide pédagogique, mini-jeux, etc.)
--
-- Le contenu (composants, routes, icônes, descriptions) reste défini en
-- code dans `src/features/modules/registry.ts`. Cette table sert
-- uniquement à piloter la visibilité publique et quelques overrides
-- éditoriaux depuis /admin/modules sans nouveau déploiement.

create table if not exists public.learning_modules (
  slug                text primary key,
  is_published        boolean not null default false,
  sort_order          integer not null default 0,
  badge_label         text,
  custom_title        text,
  custom_description  text,
  updated_at          timestamptz not null default now(),
  updated_by          uuid references auth.users(id) on delete set null
);

-- Seed : on enregistre le guide pour les bots, masqué par défaut.
-- L'éditeur le publiera depuis /admin/modules quand le contenu sera prêt.
insert into public.learning_modules (slug, is_published, sort_order, badge_label)
values ('guide-bots', false, 0, 'Bientôt')
on conflict (slug) do nothing;

-- updated_at trigger
drop trigger if exists learning_modules_set_updated_at on public.learning_modules;
create trigger learning_modules_set_updated_at
  before update on public.learning_modules
  for each row execute function public.set_updated_at();

-- RLS
alter table public.learning_modules enable row level security;

drop policy if exists "modules read"  on public.learning_modules;
drop policy if exists "modules write" on public.learning_modules;

create policy "modules read"
  on public.learning_modules for select
  to anon, authenticated
  using (true);

create policy "modules write"
  on public.learning_modules for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());
