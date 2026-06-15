-- ATFR — Accès granulaire par module admin, en complément des rôles.
--
-- `user_roles.module_access` est un tableau de clés de module admin
-- (ex: 'galerie', 'quiz', 'pages-clan'...) auxquelles l'utilisateur a accès
-- en plus de ce que lui donne déjà son rôle. Géré uniquement par les
-- super_admins depuis /admin/utilisateurs.

alter table public.user_roles
  add column if not exists module_access text[] not null default '{}';

-- list_users_with_roles renvoie maintenant aussi module_access.
drop function if exists public.list_users_with_roles();

create function public.list_users_with_roles()
returns table (
  user_id       uuid,
  email         text,
  created_at    timestamptz,
  role          text,
  module_access text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.email, u.created_at, ur.role, coalesce(ur.module_access, '{}')
  from auth.users u
  left join public.user_roles ur on ur.user_id = u.id
  where public.is_super_admin()
  order by u.created_at desc
$$;

grant execute on function public.list_users_with_roles() to authenticated;
