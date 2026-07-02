// Règle d'éligibilité recrutement (P1-4) — source unique côté client.
//
// Les seuils (min_wn8/min_battles) viennent de recruitment_settings, soit
// via le payload de player-stats (stats.recruitmentThresholds), soit via
// useRecruitmentSettings(). Ne pas réimplémenter la comparaison ailleurs :
// c'était le finding P1-4 (3 variantes divergentes de la même règle).

export interface RecruitmentThresholds {
  minWn8: number;
  minBattles: number;
}

/**
 * Éligibilité complète (WN8 + batailles). Un joueur sans WN8 connu est
 * traité comme 0 : non éligible dès qu'un seuil WN8 est fixé.
 */
export function meetsRecruitmentThresholds(
  stats: { wn8: number | null; battles: number },
  thresholds: RecruitmentThresholds,
): boolean {
  return (
    (stats.wn8 ?? 0) >= thresholds.minWn8 &&
    stats.battles >= thresholds.minBattles
  );
}

/**
 * Filtre par seuil WN8 seul (liste des mouvements de clan). Sans seuil,
 * tout passe ; avec un seuil, un WN8 inconnu est exclu — comportement
 * historique du filtre (on ne recrute pas à l'aveugle).
 */
export function meetsWn8Threshold(
  wn8: number | null | undefined,
  minWn8: number | null,
): boolean {
  if (minWn8 == null || !Number.isFinite(minWn8)) return true;
  return wn8 != null && wn8 >= minWn8;
}
