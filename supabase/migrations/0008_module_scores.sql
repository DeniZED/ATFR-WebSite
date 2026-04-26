-- ATFR — Leaderboard générique pour modules d'académie & mini-jeux.
--
-- Une seule table sert tous les modules (présents et futurs). On
-- distingue les joueurs vérifiés (Wargaming OpenID, account_id non
-- null + is_verified=true) des invités (uuid local + pseudo libre).

create table if not exists public.module_scores (
  id                  uuid primary key default gen_random_uuid(),
  module_slug         text not null,
  submode             text not null default 'default',

  -- Identité du joueur
  player_anon_id      uuid not null,
  player_nickname     text not null,
  player_account_id   bigint,
  is_verified         boolean not null default false,

  score               integer not null,
  max_score           integer not null,
  meta                jsonb not null default '{}'::jsonb,

  created_at          timestamptz not null default now(),

  -- Garde-fous DB. Score borne 0..max_score, max_score positif, pseudo
  -- non vide et de taille raisonnable. Une identité vérifiée doit avoir
  -- un account_id.
  constraint module_scores_score_range
    check (score >= 0 and score <= max_score),
  constraint module_scores_max_positive
    check (max_score > 0),
  constraint module_scores_nickname_len
    check (char_length(player_nickname) between 1 and 32),
  constraint module_scores_verified_account
    check (
      (is_verified = false)
      or (is_verified = true and player_account_id is not null)
    )
);

create index if not exists module_scores_module_idx
  on public.module_scores(module_slug, submode);
create index if not exists module_scores_top_idx
  on public.module_scores(module_slug, submode, score desc, created_at);
create index if not exists module_scores_account_idx
  on public.module_scores(player_account_id) where player_account_id is not null;
create index if not exists module_scores_anon_idx
  on public.module_scores(player_anon_id);

-- RLS : lecture publique, insertion anon, modération réservée aux modos.
alter table public.module_scores enable row level security;

drop policy if exists "module_scores read"      on public.module_scores;
drop policy if exists "module_scores insert"    on public.module_scores;
drop policy if exists "module_scores moderate"  on public.module_scores;

create policy "module_scores read"
  on public.module_scores for select
  to anon, authenticated
  using (true);

create policy "module_scores insert"
  on public.module_scores for insert
  to anon, authenticated
  with check (true);

create policy "module_scores moderate"
  on public.module_scores for delete
  to authenticated
  using (public.is_moderator());
