import type { LeaderboardEntry } from '@/features/leaderboard/queries';

// Agrégation des stats personnelles GeoGuesseur (P1-5) — extraite du
// composant GeoguesseurStats.tsx à l'identique : fenêtre 7 jours,
// meilleure distance, précision moyenne, meilleure série, répartition
// par mode (avec fallback 'random' pour les anciens scores sans meta).

export function getMeta(meta: unknown, key: string): number | null {
  if (meta && typeof meta === 'object') {
    const v = (meta as Record<string, unknown>)[key];
    return typeof v === 'number' ? v : null;
  }
  return null;
}

export function getMetaStr(meta: unknown, key: string): string | null {
  if (meta && typeof meta === 'object') {
    const v = (meta as Record<string, unknown>)[key];
    return typeof v === 'string' ? v : null;
  }
  return null;
}

export type GeoGameMode = 'daily' | 'random' | 'sprint' | 'blind';

export const MODE_LABEL: Record<GeoGameMode, string> = {
  daily: 'Quotidien',
  random: 'Aléatoire',
  sprint: 'Sprint',
  blind: 'Aveugle',
};

export function parseMode(entry: LeaderboardEntry): GeoGameMode {
  const raw = getMetaStr(entry.meta, 'game_mode') ?? '';
  return (['daily', 'random', 'sprint', 'blind'] as const).includes(raw as GeoGameMode)
    ? (raw as GeoGameMode)
    : 'random';
}

export function formatDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export interface GeoPersonalStats {
  total: number;
  last7: number;
  bestDist: number | null;
  avgAccuracy: number | null;
  bestStreak: number;
  byMode: Record<string, number>;
}

export function summariseGeoScores(
  entries: LeaderboardEntry[],
  now: number = Date.now(),
): GeoPersonalStats | null {
  if (!entries.length) return null;
  const week = now - 7 * 24 * 60 * 60 * 1000;
  let bestDist = Infinity;
  let totalAccuracy = 0;
  let accuracyCount = 0;
  let bestStreak = 0;
  const byMode: Record<string, number> = {};

  for (const e of entries) {
    const dist = getMeta(e.meta, 'distance_m') ?? Math.max(0, e.max_score - e.score);
    if (dist < bestDist) bestDist = dist;
    const acc = getMeta(e.meta, 'map_accuracy_pct');
    if (acc != null) { totalAccuracy += acc; accuracyCount++; }
    const streak = getMeta(e.meta, 'best_streak') ?? 0;
    if (streak > bestStreak) bestStreak = streak;
    const mode = parseMode(e);
    byMode[mode] = (byMode[mode] ?? 0) + 1;
  }

  return {
    total: entries.length,
    last7: entries.filter((e) => new Date(e.created_at).getTime() >= week).length,
    bestDist: Number.isFinite(bestDist) ? bestDist : null,
    avgAccuracy: accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : null,
    bestStreak,
    byMode,
  };
}
