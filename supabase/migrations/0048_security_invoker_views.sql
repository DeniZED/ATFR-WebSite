-- ATFR — Lint Supabase « Security Definer View » sur geoguesser_shots_public
-- et quiz_answers_public.
--
-- Contexte : les migrations 0044/0045 avaient créé ces vues en
-- security_invoker = false (« security definer ») pour exposer les colonnes
-- sûres de tables devenues illisibles par anon. Le Security Advisor Supabase
-- signale ce pattern car la vue s'exécute avec les droits de son créateur en
-- contournant la RLS de l'appelant. Dans notre cas le contenu exposé était
-- volontairement filtré, mais le pattern « invoker » est plus robuste : la
-- RLS de l'appelant s'applique de bout en bout et une évolution future de la
-- vue ne peut pas élargir l'accès par accident.
--
-- Bascule en 3 temps, à comportement identique pour le client :
--   1. Re-création des policies anon d'origine sur les tables de base
--      (mêmes filtres de lignes que les vues : publié / map active).
--   2. Verrou AU NIVEAU COLONNE : anon perd le droit SELECT global sur les
--      tables et ne récupère que la liste des colonnes sûres — x_pct/y_pct
--      et is_correct restent illisibles même en requêtant la table
--      directement (« permission denied for column »).
--   3. Vues passées en security_invoker = true (définition inchangée).

-- =======================================================================
-- 1. geoguesser_shots — policy anon d'origine (0009), re-créée à l'identique.
-- =======================================================================
drop policy if exists "geoguesser_shots public read" on public.geoguesser_shots;
create policy "geoguesser_shots public read"
  on public.geoguesser_shots for select to anon
  using (
    is_published = true
    and exists (
      select 1 from public.wot_maps m
      where m.id = geoguesser_shots.map_id and m.is_active = true
    )
  );

-- 2. Colonnes sûres uniquement pour anon — x_pct/y_pct exclues.
--    (Liste = exactement les colonnes sélectionnées par la vue.)
revoke select on public.geoguesser_shots from anon;
grant select (
  id, map_id, image_url, difficulty, caption, tags,
  is_published, sort_order, created_at, updated_at
) on public.geoguesser_shots to anon;

-- 3. Vue en invoker : la RLS/les grants de l'appelant s'appliquent.
alter view public.geoguesser_shots_public set (security_invoker = true);

-- =======================================================================
-- 1. quiz_answers — policy anon d'origine (0007), re-créée à l'identique.
-- =======================================================================
drop policy if exists "quiz_answers public read" on public.quiz_answers;
create policy "quiz_answers public read"
  on public.quiz_answers for select to anon
  using (
    exists (
      select 1 from public.quiz_questions q
      where q.id = quiz_answers.question_id and q.is_published = true
    )
  );

-- 2. Colonnes sûres uniquement pour anon — is_correct exclue.
revoke select on public.quiz_answers from anon;
grant select (id, question_id, label, sort_order)
  on public.quiz_answers to anon;

-- 3. Vue en invoker.
alter view public.quiz_answers_public set (security_invoker = true);
