-- ATFR — Quiz "Guide pour les bots" : scoring serveur-autoritaire (P0-1, volet quiz).
--
-- Contexte : jusqu'ici le client lisait quiz_answers en entier (y compris
-- is_correct — la bonne réponse était donc visible dans l'onglet Réseau
-- avant même de jouer), calculait lui-même son score et l'envoyait tel quel
-- à submit-score. Les tables d'analytics quiz_sessions/quiz_session_answers
-- étaient de plus écrites directement par le client avec un is_correct
-- déclaratif, polluant les stats admin (trigger tally_quiz_answer).
--
-- Cette migration (même pattern que 0044 pour le GeoGuesser) :
--   1. Remplace la lecture publique directe de quiz_answers par une vue
--      sans is_correct.
--   2. Crée quiz_game_sessions, une table interne (RLS activée, aucune
--      policy anon/authenticated) utilisée uniquement par les fonctions
--      Netlify service-role quiz-start-session / quiz-submit-answer /
--      quiz-finish-session pour piloter une partie côté serveur.
--   3. Retire les écritures client sur quiz_sessions/quiz_session_answers :
--      ces lignes d'analytics sont désormais insérées par les fonctions
--      serveur avec des données vérifiées.

-- =======================================================================
-- quiz_answers_public — colonnes sûres uniquement (pas de is_correct).
-- Vue "security definer" implicite : créée par le rôle de migration, elle
-- lit au travers du RLS de la table de base tout en restant soumise au
-- GRANT ci-dessous.
-- =======================================================================
drop policy if exists "quiz_answers public read" on public.quiz_answers;

create or replace view public.quiz_answers_public
  with (security_invoker = false)
as
select
  id,
  question_id,
  label,
  sort_order
from public.quiz_answers
where exists (
  select 1 from public.quiz_questions q
  where q.id = quiz_answers.question_id and q.is_published = true
);

grant select on public.quiz_answers_public to anon, authenticated;

-- =======================================================================
-- quiz_game_sessions — état de partie côté serveur.
-- (Distinct de quiz_sessions, qui reste la table d'analytics lue par
-- l'admin ; quiz_game_sessions porte l'état de confiance de la partie.)
-- =======================================================================
create table if not exists public.quiz_game_sessions (
  id                    uuid primary key default gen_random_uuid(),
  -- Ordre des questions choisi au lancement ('random' = mélange serveur,
  -- 'ordered' = sort_order éditorial).
  mode                  text not null check (mode in ('random', 'ordered')),
  category_id           uuid references public.quiz_categories(id) on delete set null,

  player_anon_id        uuid not null,
  player_nickname       text not null
                          check (char_length(player_nickname) between 1 and 32),
  -- Résolu une fois pour toutes au lancement via verifyPlayerToken() côté
  -- serveur — jamais ré-accepté du client ensuite.
  player_account_id     integer,

  -- Ordre canonique des questions tiré côté serveur.
  question_ids          uuid[] not null,
  question_target       integer not null check (question_target between 1 and 200),

  -- Résultats serveur-autoritaires accumulés réponse par réponse
  -- ({question_id, answer_id, is_correct, correct_answer_id}).
  results               jsonb not null default '[]'::jsonb,
  current_index         integer not null default 0,

  -- Ligne quiz_sessions (analytics admin) créée en parallèle au lancement.
  analytics_session_id  uuid references public.quiz_sessions(id) on delete set null,

  status                text not null default 'in_progress'
                          check (status in ('in_progress', 'finished')),
  created_at            timestamptz not null default now(),
  finished_at           timestamptz
);

create index if not exists quiz_game_sessions_player_idx
  on public.quiz_game_sessions(player_anon_id, created_at desc);

alter table public.quiz_game_sessions enable row level security;
-- Volontairement aucune policy anon/authenticated : cette table n'est lue
-- ou écrite que par les fonctions Netlify via le client service-role, qui
-- contourne le RLS. Sans policy, anon/authenticated n'ont accès à rien.

-- =======================================================================
-- Analytics : plus d'écriture directe par le client.
-- Les fonctions serveur (service-role) écrivent désormais quiz_sessions et
-- quiz_session_answers avec des données vérifiées ; le trigger
-- tally_quiz_answer n'est donc plus alimenté par des is_correct forgeables.
-- Les policies de lecture éditeur (stats admin) restent inchangées.
-- =======================================================================
drop policy if exists "quiz_sessions insert anon" on public.quiz_sessions;
drop policy if exists "quiz_sessions update anon" on public.quiz_sessions;
drop policy if exists "quiz_session_answers insert" on public.quiz_session_answers;
