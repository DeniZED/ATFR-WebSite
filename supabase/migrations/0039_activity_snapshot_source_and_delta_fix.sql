-- ATFR - Corrige le suivi des "jours actifs" WoT (player_activity_snapshots).
--
-- Bug 1 (le plus grave) : la fonction planifiee snapshot-player-activity.mts
-- insere ses lignes avec source = 'scheduled', mais la contrainte CHECK
-- d'origine (0019_hr_player_management.sql) n'autorisait que
-- 'manual' | 'bot' | 'api' | 'import'. Chaque execution du cron quotidien
-- violait donc la contrainte et l'upsert entier echouait silencieusement :
-- en pratique, AUCUN snapshot automatique n'a jamais ete enregistre, seuls
-- les declenchements manuels (bouton admin, source = 'manual') passaient,
-- d'ou des dates de snapshot tres irregulieres.
--
-- Bug 2 : battles_delta n'etait calcule que si un snapshot existait pour
-- "hier" exactement -> un seul jour de cron manque rendait le delta NULL
-- (donc active_day = false) meme si le joueur avait clairement joue entre
-- les deux dates (le total cumule de batailles augmente). Le code applicatif
-- compare maintenant au dernier snapshot connu (peu importe son anciennete
-- dans les 30 derniers jours) plutot qu'a "hier" strictement.
--
-- Cette migration corrige la contrainte et recalcule retroactivement
-- battles_delta / active_day sur les lignes existantes avec la meme logique
-- (comparaison au snapshot precedent reellement enregistre). Idempotente.

alter table public.player_activity_snapshots
  drop constraint if exists player_activity_snapshots_source_check;

alter table public.player_activity_snapshots
  add constraint player_activity_snapshots_source_check
  check (source in ('manual', 'bot', 'api', 'import', 'scheduled'));

with recomputed as (
  select
    id,
    battles - lag(battles) over (
      partition by account_id
      order by snapshot_date
    ) as new_delta
  from public.player_activity_snapshots
)
update public.player_activity_snapshots s
set battles_delta = r.new_delta,
    active_day = coalesce(r.new_delta, 0) > 0
from recomputed r
where r.id = s.id
  and (
    s.battles_delta is distinct from r.new_delta
    or s.active_day is distinct from (coalesce(r.new_delta, 0) > 0)
  );

notify pgrst, 'reload schema';
