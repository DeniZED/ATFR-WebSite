-- ATFR — Durcissement de la policy RLS sur module_scores.
--
-- Problème : la policy "module_scores insert" autorisait n'importe quel
-- client anon à insérer n'importe quelle valeur d'account_id avec
-- is_verified=true (les champs provenaient du localStorage — contrôlé côté
-- client).
--
-- Correction :
--   - Les inserts directs via la clé anon/authenticated sont maintenant
--     restreints à is_verified=false ET player_account_id IS NULL.
--   - Les scores vérifiés (is_verified=true) passent exclusivement par la
--     fonction Netlify `submit-score` qui utilise la clé service_role.
--     La clé service_role court-circuite le RLS → l'insert est toujours
--     possible depuis le backend, jamais depuis un client non autorisé.
--   - Les modérateurs authentifiés conservent un accès en suppression.

drop policy if exists "module_scores insert" on public.module_scores;

-- Inserts anon : score non vérifié uniquement.
create policy "module_scores insert anon"
  on public.module_scores for insert
  to anon, authenticated
  with check (
    is_verified = false
    and player_account_id is null
  );
