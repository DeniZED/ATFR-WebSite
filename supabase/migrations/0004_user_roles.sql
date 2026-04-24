-- ATFR — Rôles admin hiérarchisés.
--
-- Cette migration ajoute une table `user_roles` et durcit les policies
-- existantes pour exiger un rôle minimum.
--
-- Rôles :
--   super_admin : gestion complète + gestion des rôles
--   admin      : gestion complète sauf rôles
--   moderator  : candidatures, événements, membres (lecture/modification
--                "métier")
--   editor     : contenu éditorial (textes, highlights, palmarès,
--                témoignages, galerie)
--
-- Bootstrap : au moment de l'exécution, tous les utilisateurs Supabase
-- déjà existants reçoivent le rôle super_admin afin que les admins
-- actuels ne perdent pas l'accès. Les futurs utilisateurs devront se
-- voir attribuer un rôle manuellement depuis /admin/users.

-- =======================================================================
-- user_roles
-- =======================================================================
create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('super_admin','admin','moderator','editor')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists user_roles_role_idx on public.user_roles(role);

-- Bootstrap : tous les utilisateurs existants deviennent super_admin.
insert into public.user_roles (user_id, role)
select id, 'super_admin' from auth.users
on conflict (user_id) do nothing;

-- =======================================================================
-- Helper functions (SECURITY DEFINER pour contourner la RLS sur
-- user_roles lorsqu'on vérifie le rôle de l'utilisateur courant).
-- =======================================================================
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = auth.uid() limit 1
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'super_admin'
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('super_admin','admin')
$$;

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('super_admin','admin','moderator')
$$;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('super_admin','admin','editor')
$$;

-- RPC pour lister les utilisateurs + leur rôle (réservé super_admin).
-- Security definer : on lit auth.users que les clients n'ont pas le droit
-- d'adresser directement.
create or replace function public.list_users_with_roles()
returns table (
  user_id    uuid,
  email      text,
  created_at timestamptz,
  role       text
)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.email, u.created_at, ur.role
  from auth.users u
  left join public.user_roles ur on ur.user_id = u.id
  where public.is_super_admin()
  order by u.created_at desc
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_moderator() to authenticated;
grant execute on function public.is_editor() to authenticated;
grant execute on function public.list_users_with_roles() to authenticated;

-- =======================================================================
-- RLS sur user_roles
-- =======================================================================
alter table public.user_roles enable row level security;

drop policy if exists "user_roles self read"    on public.user_roles;
drop policy if exists "user_roles super_admin"  on public.user_roles;

create policy "user_roles self read"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_roles super_admin"
  on public.user_roles for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- =======================================================================
-- Durcissement des policies existantes
-- =======================================================================

-- applications : anon peut toujours créer, les modérateurs lisent/modifient,
-- seuls les admins peuvent supprimer.
drop policy if exists "auth can read applications"   on public.applications;
drop policy if exists "auth can update applications" on public.applications;
drop policy if exists "auth can delete applications" on public.applications;

create policy "moderator can read applications"
  on public.applications for select
  to authenticated
  using (public.is_moderator());

create policy "moderator can update applications"
  on public.applications for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

create policy "admin can delete applications"
  on public.applications for delete
  to authenticated
  using (public.is_admin());

-- events : admin pour écrire.
drop policy if exists "auth can read all events"  on public.events;
drop policy if exists "auth can write events"     on public.events;

create policy "auth can read all events"
  on public.events for select
  to authenticated
  using (true);

create policy "admin can write events"
  on public.events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- members : admin pour écrire.
drop policy if exists "auth can write members" on public.members;
create policy "admin can write members"
  on public.members for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- members_history : admin pour écrire.
drop policy if exists "auth can write history" on public.members_history;
create policy "admin can write history"
  on public.members_history for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- activity_logs : admin pour tout.
drop policy if exists "auth can access logs" on public.activity_logs;
create policy "admin can access logs"
  on public.activity_logs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- site_content : editor pour écrire.
drop policy if exists "site_content write" on public.site_content;
create policy "editor can write site_content"
  on public.site_content for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

-- media_assets : editor pour écrire.
drop policy if exists "media_assets write" on public.media_assets;
create policy "editor can write media_assets"
  on public.media_assets for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

-- highlights : editor pour écrire, lecture admin (incluant masqués).
drop policy if exists "highlights write"     on public.highlights;
drop policy if exists "highlights auth read" on public.highlights;
create policy "editor can write highlights"
  on public.highlights for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());
create policy "editor can read all highlights"
  on public.highlights for select
  to authenticated
  using (public.is_editor());

-- achievements : idem.
drop policy if exists "achievements write"     on public.achievements;
drop policy if exists "achievements auth read" on public.achievements;
create policy "editor can write achievements"
  on public.achievements for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());
create policy "editor can read all achievements"
  on public.achievements for select
  to authenticated
  using (public.is_editor());

-- testimonials : idem.
drop policy if exists "testimonials write"     on public.testimonials;
drop policy if exists "testimonials auth read" on public.testimonials;
create policy "editor can write testimonials"
  on public.testimonials for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());
create policy "editor can read all testimonials"
  on public.testimonials for select
  to authenticated
  using (public.is_editor());

-- Storage bucket public-media : editor pour écrire.
drop policy if exists "public-media insert" on storage.objects;
drop policy if exists "public-media update" on storage.objects;
drop policy if exists "public-media delete" on storage.objects;

create policy "public-media insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'public-media' and public.is_editor());

create policy "public-media update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'public-media' and public.is_editor())
  with check (bucket_id = 'public-media' and public.is_editor());

create policy "public-media delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'public-media' and public.is_editor());
