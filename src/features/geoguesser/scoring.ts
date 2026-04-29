import type { QuizDifficulty } from '@/types/database';

export const ROUND_MAX = 5000;
/** Pénalité (en points) pour une mauvaise map. Multipliée par la difficulté. */
export const WRONG_MAP_MALUS = 200;
/** Côté par défaut d'une map WoT, en mètres (utilisé en fallback). */
export const DEFAULT_MAP_SIZE_M = 1000;

const DIFFICULTY_MUL: Record<QuizDifficulty, number> = {
  easy: 1,
  medium: 1.1,
  hard: 1.25,
  expert: 1.5,
};

export interface RoundScoreInput {
  correctMap: boolean;
  /** Distance réelle entre le pick joueur et le shot, en mètres.
   * Ignorée si `correctMap` est faux. */
  distanceM: number;
  /** Côté de la map en mètres (les maps WoT sont carrées). */
  mapSizeM: number;
  difficulty: QuizDifficulty;
}

/**
 * Score d'une manche.
 *  - Mauvaise map : score négatif (= malus × difficulté). Le score "gagné"
 *    sur la manche est 0 ; on applique en plus une pénalité.
 *  - Bonne map    : 0..5000 selon la précision, × multiplicateur difficulté.
 */
export function roundScore(input: RoundScoreInput): number {
  const mul = DIFFICULTY_MUL[input.difficulty];
  if (!input.correctMap) {
    return -Math.round(WRONG_MAP_MALUS * mul);
  }
  const maxDistanceM = Math.max(1, input.mapSizeM) * Math.SQRT2;
  const precision = Math.max(0, 1 - input.distanceM / maxDistanceM);
  return Math.round(ROUND_MAX * precision * mul);
}

/**
 * Distance euclidienne réelle (en mètres) entre deux points normalisés
 * sur une map de côté `sizeM`. Les coordonnées sont dans [0,1].
 */
export function realDistanceM(
  a: { x: number; y: number },
  b: { x: number; y: number },
  sizeM: number,
): number {
  const dx = (a.x - b.x) * sizeM;
  const dy = (a.y - b.y) * sizeM;
  return Math.hypot(dx, dy);
}

/** Format compact pour l'UI : 12 m / 234 m / 1,23 km. */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2).replace('.', ',')} km`;
}

/** Score max atteignable sur une liste de difficultés. */
export function maxScoreFor(difficulties: QuizDifficulty[]): number {
  return difficulties.reduce(
    (acc, d) => acc + Math.round(ROUND_MAX * DIFFICULTY_MUL[d]),
    0,
  );
}

export interface ScoreTier {
  title: string;
  message: string;
}

export function scoreTier(pct: number): ScoreTier {
  if (pct < 30) {
    return {
      title: 'Bot dépisté',
      message:
        'On dirait que tu as joué les yeux fermés. Ouvre la minimap en jeu, parfois ça aide.',
    };
  }
  if (pct < 60) {
    return {
      title: 'Apprenti cartographe',
      message:
        'Tu reconnais les grandes maps mais tu te perds vite dans les détails. Bonne base.',
    };
  }
  if (pct < 85) {
    return {
      title: 'Cartographe ATFR',
      message: 'Solide. Les maps n’ont presque plus de secret pour toi.',
    };
  }
  return {
    title: 'Boussole humaine',
    message:
      'Reconnaissance instantanée + précision chirurgicale. Tu connais Prokhorovka mieux que ton salon.',
  };
}
