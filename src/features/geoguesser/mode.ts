// Logique pure des modes GeoGuesseur (P2-1 tranche 1 / reliquat P1-5) —
// extraite de Geoguesser.tsx à l'identique : réglages par mode,
// disponibilité par difficulté, libellés, submode de leaderboard. Les
// copies serveur vivent dans netlify/functions/_geoguesser-scoring.ts.
import type { QuizDifficulty } from '@/types/database';
import { DEFAULT_GEO_SETTINGS, type PublicShot } from './queries';
import { worstTotalFor, type RoundScoreSettings } from './scoring';

export type DifficultyFilter = QuizDifficulty | 'all';
export type GameMode = 'daily' | 'random' | 'sprint' | 'blind';

export interface DifficultyAvailability {
  mapCount: number;
  shotCount: number;
  requiredMapCount: number;
  requiredShotCount: number;
  disabled: boolean;
}

export interface GeoguesserModeSettings {
  dailyRounds: number;
  randomRounds: number;
  sprintRounds: number;
  sprintRoundTimeS: number;
  sprintTimePenaltyM: number;
  blindRounds: number;
  blindPreviewSeconds: number;
  minMapsDaily: number;
  minMapsRandom: number;
  minMapsSprint: number;
  minMapsBlind: number;
}


export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function getDailyChallengeKey(date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    if (year && month && day) return `${year}-${month}-${day}`;
  } catch {
    /* fallback below */
  }
  return date.toISOString().slice(0, 10);
}

export function formatChallengeDate(key: string): string {
  const [, month, day] = key.split('-');
  return month && day ? `${day}/${month}` : key;
}

export function getModeSettings(
  settings: typeof DEFAULT_GEO_SETTINGS,
): GeoguesserModeSettings {
  return {
    dailyRounds: clampNumber(settings.daily_challenge_rounds, 1, 20),
    randomRounds: clampNumber(settings.random_rounds, 1, 20),
    sprintRounds: clampNumber(settings.sprint_rounds, 1, 30),
    sprintRoundTimeS: clampNumber(settings.sprint_round_time_s, 5, 120),
    sprintTimePenaltyM: clampNumber(settings.sprint_time_penalty_m, 0, 1000),
    blindRounds: clampNumber(settings.blind_rounds, 1, 20),
    blindPreviewSeconds: clampNumber(settings.blind_preview_seconds, 1, 60),
    minMapsDaily: clampNumber(settings.min_maps_daily, 1, 100),
    minMapsRandom: clampNumber(settings.min_maps_random, 1, 100),
    minMapsSprint: clampNumber(settings.min_maps_sprint, 1, 100),
    minMapsBlind: clampNumber(settings.min_maps_blind, 1, 100),
  };
}

export function getRoundTargetForMode(
  mode: GameMode,
  settings: GeoguesserModeSettings,
): number {
  if (mode === 'daily') return settings.dailyRounds;
  if (mode === 'sprint') return settings.sprintRounds;
  if (mode === 'blind') return settings.blindRounds;
  return settings.randomRounds;
}

export function getMinMapRequirement(
  mode: GameMode,
  settings: GeoguesserModeSettings,
): number {
  if (mode === 'daily') return settings.minMapsDaily;
  if (mode === 'sprint') return settings.minMapsSprint;
  if (mode === 'blind') return settings.minMapsBlind;
  return settings.minMapsRandom;
}

export function getRoundTimeLimit(
  mode: GameMode,
  roundTimeS: number,
  settings: GeoguesserModeSettings,
): number {
  if (mode === 'sprint') {
    return settings.sprintRoundTimeS;
  }
  return roundTimeS;
}

export function getBlindPreviewSeconds(
  settings: GeoguesserModeSettings,
  roundTimeS: number,
): number {
  return Math.min(settings.blindPreviewSeconds, roundTimeS);
}

export function getWorstTotalForMode(
  mode: GameMode,
  rounds: number,
  scoreSettings: RoundScoreSettings,
  roundTimeS: number,
  modeSettings: GeoguesserModeSettings,
): number {
  const baseWorst = worstTotalFor(rounds, scoreSettings);
  if (mode !== 'sprint') return baseWorst;
  const sprintWorst =
    rounds *
    (scoreSettings.timeoutMalusM +
      roundTimeS * modeSettings.sprintTimePenaltyM);
  return Math.max(baseWorst, sprintWorst);
}

export function formatModeLabel(mode: GameMode, challengeKey: string): string {
  if (mode === 'daily') return `Défi ${formatChallengeDate(challengeKey)}`;
  if (mode === 'sprint') return 'Sprint';
  if (mode === 'blind') return 'Blind Guess';
  return 'Série libre';
}

export function formatGenericModeLabel(mode: GameMode): string {
  if (mode === 'daily') return 'Challenge du jour';
  return formatModeLabel(mode, getDailyChallengeKey());
}

export function formatScoreModeLabel(mode: GameMode, dailyKey?: string | null): string {
  if (mode === 'daily' && dailyKey) return formatModeLabel(mode, dailyKey);
  return formatGenericModeLabel(mode);
}

export function getStartButtonLabel(mode: GameMode): string {
  if (mode === 'daily') return 'Lancer le challenge';
  if (mode === 'sprint') return 'Lancer le sprint';
  if (mode === 'blind') return 'Lancer Blind Guess';
  return 'Lancer une série';
}

export function getDifficultyDetail(difficulty: QuizDifficulty): string {
  if (difficulty === 'easy') return 'Repères évidents';
  if (difficulty === 'medium') return 'Lecture de map';
  if (difficulty === 'hard') return 'Zones piégeuses';
  return 'Micro-repères';
}

export function getDifficultyDotClass(difficulty: DifficultyFilter): string {
  if (difficulty === 'easy') return 'border-atfr-success bg-atfr-success';
  if (difficulty === 'medium') return 'border-atfr-gold bg-atfr-gold';
  if (difficulty === 'hard') return 'border-atfr-warning bg-atfr-warning';
  if (difficulty === 'expert') return 'border-atfr-danger bg-atfr-danger';
  return 'border-atfr-fog bg-atfr-fog';
}

export function buildDifficultyAvailability(
  shots: PublicShot[],
  requiredMapCount: number,
  requiredShotCount: number,
): Record<DifficultyFilter, DifficultyAvailability> {
  const empty = (): DifficultyAvailability => ({
    mapCount: 0,
    shotCount: 0,
    requiredMapCount,
    requiredShotCount,
    disabled: requiredMapCount > 0,
  });
  const result: Record<DifficultyFilter, DifficultyAvailability> = {
    all: empty(),
    easy: empty(),
    medium: empty(),
    hard: empty(),
    expert: empty(),
  };
  const byDifficulty: Record<DifficultyFilter, Set<string>> = {
    all: new Set<string>(),
    easy: new Set<string>(),
    medium: new Set<string>(),
    hard: new Set<string>(),
    expert: new Set<string>(),
  };
  const shotCounts: Record<DifficultyFilter, number> = {
    all: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
  };

  for (const shot of shots) {
    byDifficulty.all.add(shot.map_id);
    byDifficulty[shot.difficulty].add(shot.map_id);
    shotCounts.all += 1;
    shotCounts[shot.difficulty] += 1;
  }

  for (const key of Object.keys(result) as DifficultyFilter[]) {
    const mapCount = byDifficulty[key].size;
    result[key] = {
      mapCount,
      shotCount: shotCounts[key],
      requiredMapCount,
      requiredShotCount,
      disabled:
        mapCount < requiredMapCount || shotCounts[key] < requiredShotCount,
    };
  }

  return result;
}

export function getFirstAvailableDifficulty(
  availability: Record<DifficultyFilter, DifficultyAvailability>,
): DifficultyFilter | null {
  const preferred: DifficultyFilter[] = [
    'all',
    'easy',
    'medium',
    'hard',
    'expert',
  ];
  return (
    preferred.find((difficulty) => !availability[difficulty].disabled) ?? null
  );
}

export function getStartDisabledReason(
  hasNickname: boolean,
  availability: DifficultyAvailability | undefined,
): string | null {
  if (!hasNickname) return "Choisis d'abord un pseudo";
  if (!availability?.disabled) return null;
  if (availability.mapCount < availability.requiredMapCount) {
    return `Il faut ${availability.requiredMapCount} maps minimum pour ce mode.`;
  }
  return `Il faut ${availability.requiredShotCount} screenshots minimum pour ce mode.`;
}



export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}m ${rest.toString().padStart(2, '0')}s` : `${rest}s`;
}

export function getLeaderboardSubmode(
  mode: GameMode,
  difficulty: DifficultyFilter,
  challengeKey: string,
  dailyRounds: number,
  settings: GeoguesserModeSettings,
): string {
  const difficultyKey = difficulty === 'all' ? 'default' : difficulty;
  if (mode === 'daily') {
    return `daily:${challengeKey}:${difficultyKey}:${dailyRounds}`;
  }
  if (mode === 'sprint') {
    return `sprint:${difficultyKey}:${settings.sprintRounds}`;
  }
  if (mode === 'blind') {
    return `blind:${difficultyKey}:${settings.blindRounds}`;
  }
  return settings.randomRounds === 5
    ? difficultyKey
    : `random:${difficultyKey}:${settings.randomRounds}`;
}
