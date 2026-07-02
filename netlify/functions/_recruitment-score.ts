// ATFR — Score de recrutement (P2-4).
//
// Fonction pure extraite de player-stats.mts pour être testable
// (src/__tests__/recruitment-score.test.ts), même convention que
// _player-token.ts / _geoguesser-scoring.ts. Aucun changement de logique
// par rapport à l'implémentation historique.

export interface RecruitmentSettings {
  min_wn8: number;
  min_battles: number;
  weight_wn8: number;
  weight_winrate: number;
  weight_battles: number;
  weight_tier10: number;
}

export const DEFAULT_RECRUITMENT_SETTINGS: RecruitmentSettings = {
  min_wn8: 0,
  min_battles: 0,
  weight_wn8: 40,
  weight_winrate: 20,
  weight_battles: 15,
  weight_tier10: 25,
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Score 0-100 = moyenne pondérée de quatre facteurs normalisés (WN8, winrate,
// expérience en batailles, nombre de tier 10). Un facteur sans donnée est
// simplement exclu de la moyenne (son poids n'est pas compté) plutôt que de
// pénaliser le joueur.
export function computeRecruitmentScore(
  stats: { wn8: number | null; winRate: number | null; battles: number; tier10Count: number },
  settings: RecruitmentSettings,
): number | null {
  const factors: Array<{ value: number | null; weight: number }> = [
    { value: stats.wn8 != null ? clamp01(stats.wn8 / 3400) * 100 : null, weight: settings.weight_wn8 },
    {
      value: stats.winRate != null ? clamp01((stats.winRate - 42) / (60 - 42)) * 100 : null,
      weight: settings.weight_winrate,
    },
    { value: clamp01(stats.battles / 20000) * 100, weight: settings.weight_battles },
    { value: clamp01(stats.tier10Count / 8) * 100, weight: settings.weight_tier10 },
  ];

  let weightedSum = 0;
  let weightTotal = 0;
  for (const factor of factors) {
    if (factor.value == null || factor.weight <= 0) continue;
    weightedSum += factor.value * factor.weight;
    weightTotal += factor.weight;
  }
  if (weightTotal === 0) return null;
  return Math.round(weightedSum / weightTotal);
}
