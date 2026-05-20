-- ATFR — Durcissement RLS module_scores : contraintes sur les insertions anon.
--
-- Sans ces contraintes, un client peut appeler directement l'API Supabase
-- (en bypassant la fonction Netlify submit-score) avec la clé anon et insérer
-- des scores avec n'importe quel pseudo ou module_slug.
--
-- On renforce la policy existante en ajoutant :
--   - Longueur du player_nickname : entre 1 et 32 caractères
--   - Format du module_slug : alphanumérique + tirets uniquement
--   - Contrainte d'unicité journalière par joueur/module/submode

drop policy if exists "module_scores insert anon" on public.module_scores;

create policy "module_scores insert anon"
  on public.module_scores for insert
  to anon, authenticated
  with check (
    is_verified = false
    and player_account_id is null
    and char_length(player_nickname) between 1 and 32
    and module_slug ~ '^[a-z0-9_-]{1,64}$'
  );

-- Limite une soumission de score non vérifiée par joueur, par module et par jour.
-- Les inserts via service_role (submit-score function) court-circuitent le RLS.
create unique index if not exists module_scores_anon_daily_uidx
  on public.module_scores (player_anon_id, module_slug, submode, date_trunc('day', created_at))
  where is_verified = false;
