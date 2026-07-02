-- ATFR — GeoGuesser : scoring serveur-autoritaire (P0-1).
--
-- Contexte : jusqu'ici le client lisait directement geoguesser_shots (qui
-- contient x_pct/y_pct, la position correcte) et calculait lui-même le
-- score envoyé à submit-score. Un joueur pouvait donc lire la réponse
-- correcte côté client et/ou forger n'importe quel score.
--
-- Cette migration :
--   1. Retire la lecture publique directe de geoguesser_shots (qui exposait
--      x_pct/y_pct) et la remplace par une vue sans colonnes de coordonnées.
--   2. Crée geoguesser_sessions, une table interne (RLS activée, aucune
--      policy anon/authenticated) utilisée uniquement par les fonctions
--      Netlify service-role geoguesser-start-session / -submit-round /
--      -finish-session pour piloter une partie côté serveur : pool de
--      manches, réglages figés au lancement, résultat de chaque manche et
--      horodatage serveur du timer (le client ne peut plus déclarer son
--      propre temps écoulé).

-- =======================================================================
-- geoguesser_shots_public — colonnes sûres uniquement (pas de x_pct/y_pct).
-- Vue "security definer" implicite : créée par le rôle de migration qui a
-- accès complet à la table, donc elle peut filtrer/lire au travers du RLS
-- de la table de base tout en restant elle-même soumise au GRANT ci-dessous.
-- =======================================================================
drop policy if exists "geoguesser_shots public read" on public.geoguesser_shots;

create or replace view public.geoguesser_shots_public
  with (security_invoker = false)
as
select
  id,
  map_id,
  image_url,
  difficulty,
  caption,
  tags,
  is_published,
  sort_order,
  created_at,
  updated_at
from public.geoguesser_shots
where is_published = true
  and exists (
    select 1 from public.wot_maps m
    where m.id = geoguesser_shots.map_id and m.is_active = true
  );

grant select on public.geoguesser_shots_public to anon, authenticated;

-- =======================================================================
-- geoguesser_sessions — état de partie côté serveur.
-- =======================================================================
create table if not exists public.geoguesser_sessions (
  id                 uuid primary key default gen_random_uuid(),
  mode               text not null
                       check (mode in ('daily', 'random', 'sprint', 'blind')),
  difficulty         text not null
                       check (difficulty in ('all', 'easy', 'medium', 'hard', 'expert')),
  training_mode      boolean not null default false,

  player_anon_id     uuid not null,
  player_nickname    text not null
                       check (char_length(player_nickname) between 1 and 32),
  -- Résolu une fois pour toutes au lancement via verifyPlayerToken() côté
  -- serveur — jamais ré-accepté du client ensuite.
  player_account_id  integer,

  daily_key          text,
  -- Pool de manches tiré côté serveur (ids uniquement, pas de coordonnées).
  shot_ids           uuid[] not null,
  round_target       integer not null check (round_target between 1 and 30),

  -- Réglages figés au lancement (timer, malus, etc.) pour que la partie
  -- reste cohérente même si l'admin modifie geoguesser_settings en cours
  -- de route.
  settings           jsonb not null,
  -- Résultats serveur-autoritaires accumulés manche par manche.
  results            jsonb not null default '[]'::jsonb,
  current_round      integer not null default 0,
  -- Reset à chaque manche soumise : sert de base au calcul du temps écoulé
  -- serveur (le client ne peut plus déclarer son propre elapsedSeconds).
  round_started_at   timestamptz not null default now(),

  status             text not null default 'in_progress'
                       check (status in ('in_progress', 'finished')),
  created_at         timestamptz not null default now(),
  finished_at        timestamptz
);

create index if not exists geoguesser_sessions_player_idx
  on public.geoguesser_sessions(player_anon_id, created_at desc);

alter table public.geoguesser_sessions enable row level security;
-- Volontairement aucune policy anon/authenticated : cette table n'est lue
-- ou écrite que par les fonctions Netlify via le client service-role, qui
-- contourne le RLS. Sans policy, anon/authenticated n'ont accès à rien.
