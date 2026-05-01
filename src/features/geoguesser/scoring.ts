import type { QuizDifficulty } from '@/types/database';

/**
 * Modèle de scoring "proximité" (lower-is-better).
 *
 *  - Bonne map + pick : score = distance réelle en mètres entre le pick
 *    joueur et le shot (arrondi). Plus c'est proche, mieux c'est.
 *  - Bonne map sans pick (timeout) : score = `timeout_malus_m`.
 *  - Mauvaise map : score = `wrong_map_malus_m`.
 *
 *  Le score TOTAL est la somme des manches : il faut viser le plus
 *  bas possible.
 */

export interface RoundScoreSettings {
  wrongMapMalusM: number;
  timeoutMalusM: number;
}

export interface RoundScoreInput {
  correctMap: boolean;
  /** True si le joueur a posé un pin avant la fin du timer. */
  hasPick: boolean;
  /** Distance pick ↔ shot en mètres. Pertinent uniquement si correctMap. */
  distanceM: number;
  settings: RoundScoreSettings;
}

export interface RoundScoreResult {
  /** Score de la manche, en mètres. Toujours positif. */
  score: number;
  /** Type de score, pour l'affichage. */
  kind: 'distance' | 'wrong-map' | 'timeout';
}

export function roundScore(input: RoundScoreInput): RoundScoreResult {
  if (!input.correctMap) {
    return { score: input.settings.wrongMapMalusM, kind: 'wrong-map' };
  }
  if (!input.hasPick) {
    return { score: input.settings.timeoutMalusM, kind: 'timeout' };
  }
  return {
    score: Math.max(0, Math.round(input.distanceM)),
    kind: 'distance',
  };
}

/**
 * Distance euclidienne réelle (mètres) entre deux points normalisés
 * sur une map de dimensions widthM × heightM. Coords dans [0,1].
 */
export function realDistanceM(
  a: { x: number; y: number },
  b: { x: number; y: number },
  widthM: number,
  heightM: number,
): number {
  const dx = (a.x - b.x) * Math.max(1, widthM);
  const dy = (a.y - b.y) * Math.max(1, heightM);
  return Math.hypot(dx, dy);
}

/** Diagonale réelle d'une map width × height en mètres. */
export function diagonalM(widthM: number, heightM: number): number {
  return Math.hypot(Math.max(1, widthM), Math.max(1, heightM));
}

/** Format compact : 12 m / 234 m / 1,23 km. */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2).replace('.', ',')} km`;
}

/** Score "max" théorique (si toutes les manches étaient timeout/mauvaise map). */
export function worstTotalFor(
  rounds: number,
  settings: RoundScoreSettings,
): number {
  return rounds * Math.max(settings.wrongMapMalusM, settings.timeoutMalusM);
}

export interface ScoreTier {
  title: string;
  message: string;
}

/** Classement basé sur la distance moyenne par manche (en mètres). */
export function scoreTier(avgDistanceM: number): ScoreTier {
  if (avgDistanceM < 80) {
    return {
      title: 'Boussole humaine',
      message:
        'Reconnaissance instantanée + précision chirurgicale. Tu connais Prokhorovka mieux que ton salon.',
    };
  }
  if (avgDistanceM < 200) {
    return {
      title: 'Cartographe ATFR',
      message: 'Solide. Les maps n’ont presque plus de secret pour toi.',
    };
  }
  if (avgDistanceM < 600) {
    return {
      title: 'Apprenti cartographe',
      message:
        'Tu reconnais les grandes maps mais tu te perds vite dans les détails. Bonne base.',
    };
  }
  return {
    title: 'Bot dépisté',
    message:
      'On dirait que tu as joué les yeux fermés. Ouvre la minimap en jeu, parfois ça aide.',
  };
}

// --- Difficulté multiplicateur conservée pour la rétro-compat des écrans
// admin (badge de difficulté) ; le scoring n'en dépend plus. ---
export const DIFFICULTY_MULTIPLIER: Record<QuizDifficulty, number> = {
  easy: 1,
  medium: 1.1,
  hard: 1.25,
  expert: 1.5,
};
