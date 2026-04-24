-- ATFR — helpers publics (compteurs + configuration Discord).
--
-- Ajouts :
--   1. Fonction count_pending_applications() : retourne le nb de
--      candidatures en attente. SECURITY DEFINER pour contourner la
--      RLS (qui empêche les anons de lire les applications). Seule la
--      valeur agrégée est exposée, jamais de donnée personnelle.
--   2. Nouvelles clés dans site_content pour la config du widget
--      Discord (server ID + URL d'invitation de secours).

-- =======================================================================
-- Compteur public de candidatures en attente
-- =======================================================================
create or replace function public.count_pending_applications()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(count(*), 0)::integer
  from public.applications
  where status = 'pending'
$$;

grant execute on function public.count_pending_applications() to anon, authenticated;

-- =======================================================================
-- Clés site_content pour Discord
-- =======================================================================
insert into public.site_content (key, value, kind, label) values
  ('discord_server_id',  '', 'text', 'ID du serveur Discord (widget)'),
  ('discord_invite_url', '', 'url',  'URL d''invitation Discord (fallback)')
on conflict (key) do nothing;
