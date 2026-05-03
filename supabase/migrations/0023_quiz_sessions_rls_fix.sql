-- ATFR — Durcissement de la policy RLS sur quiz_sessions.
--
-- La policy "quiz_sessions update self" utilisait USING (true), permettant à
-- n'importe quel utilisateur authentifié de modifier la session d'un autre
-- joueur (triche sur les scores).
--
-- Correction :
--   - Les utilisateurs authentifiés ne peuvent mettre à jour que leurs propres
--     sessions (user_id = auth.uid()).
--   - Les sessions anonymes (user_id IS NULL) restent modifiables par les
--     utilisateurs anon puisqu'il n'existe pas d'identifiant stable pour eux.
--   - Les éditeurs et admins peuvent toujours tout lire/modifier.

drop policy if exists "quiz_sessions update self" on public.quiz_sessions;

-- Utilisateurs authentifiés : uniquement leur propre session.
create policy "quiz_sessions update own"
  on public.quiz_sessions for update
  to authenticated
  using (user_id = auth.uid() or public.is_editor())
  with check (user_id = auth.uid() or public.is_editor());

-- Utilisateurs anon : uniquement les sessions sans user_id (sessions anon).
create policy "quiz_sessions update anon"
  on public.quiz_sessions for update
  to anon
  using (user_id is null)
  with check (user_id is null);
