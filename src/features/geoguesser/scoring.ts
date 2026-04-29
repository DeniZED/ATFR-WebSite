import type { QuizDifficulty } from '@/types/database';

export const ROUND_MAX = 5000;
export const WRONG_MAP_PENALTY = 200;

const DIFFICULTY_MUL: Record<QuizDifficulty, number> = {
  easy: 1,
  medium: 1.1,
  hard: 1.25,
  expert: 1.5,
};

export function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export interface RoundScoreInput {
  correctMap: boolean;
  /** Euclidean distance in normalized [0,1] space (0..√2). Ignored when
   * correctMap = false. */
  distance: number;
  difficulty: QuizDifficulty;
}

/** Score a single round. */
export function roundScore(input: RoundScoreInput): number {
  const mul = DIFFICULTY_MUL[input.difficulty];
  if (!input.correctMap) return Math.round(WRONG_MAP_PENALTY * mul);
  const precision = Math.max(0, 1 - input.distance / Math.SQRT2);
  return Math.round(ROUND_MAX * precision * mul);
}

/** Max possible score given a list of difficulties. */
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
      message:
        'Solide. Les maps n’ont presque plus de secret pour toi.',
    };
  }
  return {
    title: 'Boussole humaine',
    message:
      'Reconnaissance instantanée + précision chirurgicale. Tu connais Prokhorovka mieux que ton salon.',
  };
}
