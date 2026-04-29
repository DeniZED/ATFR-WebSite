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
  /** Distance réelle pick joueur ↔ shot, en mètres. Ignorée si correctMap=false. */
  distanceM: number;
  /** Diagonale réelle de la map en mètres (= sqrt(width² + height²)). */
  diagonalM: number;
  difficulty: QuizDifficulty;
}

/** Fraction de la diagonale au-delà de laquelle la précision tend vers 0.
 *  Plus la valeur est petite, plus le score chute vite avec la distance.
 *  À 0.18 sur une map 1000×1000 (diag ≈ 1414 m) : decay ≈ 254 m
 *   - 0 m   → 100 %
 *   - 100 m → 67 %
 *   - 250 m → 37 %
 *   - 500 m → 14 %
 *   - 1000 m → 2 %
 */
const SCORE_DECAY_FRACTION = 0.18;

/**
 *  Mauvaise map : -malus × difficulté (0 point gagné + pénalité).
 *  Bonne map    : 5000 × exp(-d / decay) × multiplicateur de difficulté.
 */
export function roundScore(input: RoundScoreInput): number {
  const mul = DIFFICULTY_MUL[input.difficulty];
  if (!input.correctMap) return -Math.round(WRONG_MAP_MALUS * mul);
  const decay = Math.max(50, input.diagonalM * SCORE_DECAY_FRACTION);
  const precision = Math.exp(-Math.max(0, input.distanceM) / decay);
  return Math.round(ROUND_MAX * precision * mul);
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
