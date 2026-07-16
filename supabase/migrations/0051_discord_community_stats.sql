-- ATFR — Statistiques publiques de la communauté Discord.
--
-- Objectif : alimenter la section « Discord » de la home avec des agrégats
-- sûrs, calculés à partir des tables peuplées par le bot :
--   - public.discord_guild_members  (tous les membres + rôles)
--   - public.discord_voice_sessions (temps vocal)
-- Ces tables sont en RLS admin ; on expose donc UNIQUEMENT des compteurs
-- agrégés (aucune donnée personnelle) via une fonction SECURITY DEFINER,
-- appelée côté serveur par la fonction Netlify discord-community.
--
-- Idempotente : peut être relancée sans risque.

-- =======================================================================
-- 1. Clés site_content : IDs des rôles de clan (éditables en admin)
-- =======================================================================
insert into public.site_content (key, value, kind, label) values
  ('discord_role_atfr', '', 'text', 'Discord — ID du rôle ATFR (comptage membres)'),
  ('discord_role_ato',  '', 'text', 'Discord — ID du rôle A-T-O (comptage membres)')
on conflict (key) do nothing;

-- =======================================================================
-- 2. Fonction d'agrégats communautaires
-- =======================================================================
-- p_guild_id peut être null : dans ce cas on ne filtre pas par serveur.
-- Les rôles peuvent être null/'' : les compteurs par clan renvoient alors 0.
-- Le statut « en ligne » dépend de discord_guild_members.status, alimenté
-- par le bot s'il suit la présence ; sinon les compteurs online valent 0
-- et l'UI retombe proprement sur les totaux par clan.
create or replace function public.discord_community_stats(
  p_guild_id text default null,
  p_atfr_role text default null,
  p_ato_role text default null
)
returns table (
  total_members integer,
  atfr_members integer,
  ato_members integer,
  online_total integer,
  atfr_online integer,
  ato_online integer,
  voice_seconds_30d bigint,
  voice_members_30d integer
)
language sql
stable
security definer
set search_path = public
as $$
  with members as (
    select status, roles
    from public.discord_guild_members
    where p_guild_id is null or guild_id is null or guild_id = p_guild_id
  ),
  voice as (
    select discord_user_id, duration_seconds
    from public.discord_voice_sessions
    where joined_at >= now() - interval '30 days'
      and (p_guild_id is null or guild_id is null or guild_id = p_guild_id)
  )
  select
    (select count(*) from members)::integer as total_members,
    (select count(*) from members
       where nullif(p_atfr_role, '') is not null and p_atfr_role = any(roles))::integer as atfr_members,
    (select count(*) from members
       where nullif(p_ato_role, '') is not null and p_ato_role = any(roles))::integer as ato_members,
    (select count(*) from members
       where status in ('online', 'idle', 'dnd'))::integer as online_total,
    (select count(*) from members
       where status in ('online', 'idle', 'dnd')
         and nullif(p_atfr_role, '') is not null and p_atfr_role = any(roles))::integer as atfr_online,
    (select count(*) from members
       where status in ('online', 'idle', 'dnd')
         and nullif(p_ato_role, '') is not null and p_ato_role = any(roles))::integer as ato_online,
    (select coalesce(sum(duration_seconds), 0) from voice)::bigint as voice_seconds_30d,
    (select count(distinct discord_user_id) from voice
       where duration_seconds > 0)::integer as voice_members_30d
$$;

-- Appelée exclusivement par la fonction Netlify (service role), qui passe
-- une configuration figée. Non exposée à anon pour éviter l'énumération de
-- compteurs par rôle arbitraire.
grant execute on function public.discord_community_stats(text, text, text)
  to service_role;
