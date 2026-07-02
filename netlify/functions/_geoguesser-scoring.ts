// ATFR — GeoGuesser : scoring/pool serveur-autoritaire (P0-1).
//
// Copie serveur des fonctions pures de src/features/geoguesser/scoring.ts
// (roundScore/realDistanceM/diagonalM/worstTotalFor) et des helpers de
// mode/pool de src/pages/modules/Geoguesser.tsx — dupliqués plutôt
// qu'importés (netlify/functions ne dépend pas de src/), avec un test de
// parité dans src/__tests__ pour détecter toute dérive.
//
// Les wrappers de mode (getSprintTimePenalty/getWorstTotalForMode/
// getLeaderboardSubmode) prennent ici des scalaires bruts plutôt que
// l'objet GeoguesserModeSettings complet du client, car seule la session
// (settings jsonb figés au lancement) fournit le contexte nécessaire.

export type GameMode = 'daily' | 'random' | 'sprint' | 'blind';
export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard' | 'expert';

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

export type RoundScoreKind = 'distance' | 'wrong-map' | 'timeout';

export interface RoundScoreResult {
  /** Score de la manche, en mètres. Toujours positif. */
  score: number;
  kind: RoundScoreKind;
}

export function roundScore(input: RoundScoreInput): RoundScoreResult {
  if (!input.hasPick) {
    return { score: input.settings.timeoutMalusM, kind: 'timeout' };
  }
  if (!input.correctMap) {
    return { score: input.settings.wrongMapMalusM, kind: 'wrong-map' };
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

/** Score "max" théorique (si toutes les manches étaient timeout/mauvaise map). */
export function worstTotalFor(
  rounds: number,
  settings: RoundScoreSettings,
): number {
  return rounds * Math.max(settings.wrongMapMalusM, settings.timeoutMalusM);
}

// ---------------------------------------------------------------------------
// Mode/settings helpers
// ---------------------------------------------------------------------------

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

export interface GeoSettingsRow {
  round_time_s: number;
  wrong_map_malus_m: number;
  timeout_malus_m: number;
  daily_challenge_rounds: number;
  random_rounds: number;
  sprint_rounds: number;
  sprint_round_time_s: number;
  sprint_time_penalty_m: number;
  blind_rounds: number;
  blind_preview_seconds: number;
  min_maps_daily: number;
  min_maps_random: number;
  min_maps_sprint: number;
  min_maps_blind: number;
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

export function getModeSettings(settings: GeoSettingsRow): GeoguesserModeSettings {
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

/** Pénalité de temps Sprint (mètres), 0 pour tout autre mode/kind. */
export function getSprintTimePenalty(
  mode: GameMode,
  kind: RoundScoreKind,
  elapsedSeconds: number,
  sprintTimePenaltyM: number,
): number {
  if (mode !== 'sprint' || kind !== 'distance') return 0;
  return Math.round(Math.max(0, elapsedSeconds) * sprintTimePenaltyM);
}

export function getWorstTotalForMode(
  mode: GameMode,
  rounds: number,
  scoreSettings: RoundScoreSettings,
  roundTimeS: number,
  sprintTimePenaltyM: number,
): number {
  const baseWorst = worstTotalFor(rounds, scoreSettings);
  if (mode !== 'sprint') return baseWorst;
  const sprintWorst =
    rounds * (scoreSettings.timeoutMalusM + roundTimeS * sprintTimePenaltyM);
  return Math.max(baseWorst, sprintWorst);
}

export function getLeaderboardSubmode(
  mode: GameMode,
  difficulty: DifficultyFilter,
  challengeKey: string,
  dailyRounds: number,
  opts: { randomRounds: number; sprintRounds: number; blindRounds: number },
): string {
  const difficultyKey = difficulty === 'all' ? 'default' : difficulty;
  if (mode === 'daily') {
    return `daily:${challengeKey}:${difficultyKey}:${dailyRounds}`;
  }
  if (mode === 'sprint') {
    return `sprint:${difficultyKey}:${opts.sprintRounds}`;
  }
  if (mode === 'blind') {
    return `blind:${difficultyKey}:${opts.blindRounds}`;
  }
  return opts.randomRounds === 5
    ? difficultyKey
    : `random:${difficultyKey}:${opts.randomRounds}`;
}

// ---------------------------------------------------------------------------
// Pool selection — identique à src/pages/modules/Geoguesser.tsx, opérant sur
// des ids + map_id (pas de coordonnées nécessaires côté pool selection).
// ---------------------------------------------------------------------------

export function createSeededRandom(seed: string): () => number {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    state ^= seed.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PoolShot {
  id: string;
  map_id: string;
  image_url: string;
}

export function sortShotsStable<T extends PoolShot>(shots: T[]): T[] {
  return [...shots].sort((a, b) => {
    const map = a.map_id.localeCompare(b.map_id);
    if (map !== 0) return map;
    return a.id.localeCompare(b.id);
  });
}

export function pickPool<T extends PoolShot>(
  all: T[],
  n: number,
  rng: () => number = Math.random,
): T[] {
  if (all.length === 0) return [];
  // Group by map.
  const byMap = new Map<string, T[]>();
  for (const s of all) {
    const k = s.map_id ?? '_none';
    const arr = byMap.get(k) ?? [];
    arr.push(s);
    byMap.set(k, arr);
  }
  // Shuffle each bucket independently.
  for (const arr of byMap.values()) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  // Pick one shot per map first (random map order), then refill.
  const mapKeys = [...byMap.keys()];
  for (let i = mapKeys.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [mapKeys[i], mapKeys[j]] = [mapKeys[j], mapKeys[i]];
  }
  const out: T[] = [];
  const seenIds = new Set<string>();
  const seenImgs = new Set<string>();
  for (const k of mapKeys) {
    if (out.length >= n) break;
    const arr = byMap.get(k);
    if (!arr || arr.length === 0) continue;
    const s = arr.shift()!;
    if (seenIds.has(s.id) || seenImgs.has(s.image_url)) continue;
    seenIds.add(s.id);
    seenImgs.add(s.image_url);
    out.push(s);
  }
  // Refill from the remaining shots (still shuffled inside their bucket).
  if (out.length < n) {
    const rest: T[] = [];
    for (const arr of byMap.values()) rest.push(...arr);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    for (const s of rest) {
      if (out.length >= n) break;
      if (seenIds.has(s.id) || seenImgs.has(s.image_url)) continue;
      seenIds.add(s.id);
      seenImgs.add(s.image_url);
      out.push(s);
    }
  }
  return out;
}
