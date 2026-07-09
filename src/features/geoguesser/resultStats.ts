// Stats de résultats et de progression GeoGuesseur (P2-1 tranche 2) —
// extraites de Geoguesser.tsx à l'identique.
import type { ShotWithMap } from '@/features/geoguesser/queries';
import type { LeaderboardEntry } from '@/features/leaderboard/queries';
import type { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import type { GameMode } from '@/features/geoguesser/mode';
import type { RoundScoreResult } from '@/features/geoguesser/scoring';


export interface RoundResult {
  shot: ShotWithMap;
  selectedMapId: string | null;
  selectedX: number | null;
  selectedY: number | null;
  correctMap: boolean;
  /** Distance pick ↔ shot en mètres (null si mauvaise map ou pas de pick). */
  distanceM: number | null;
  /** Score de la manche en mètres (lower-is-better). */
  score: number;
  baseScore: number;
  timePenalty: number;
  elapsedSeconds: number;
  kind: RoundScoreResult['kind'];
}


export type BadgeVariant = 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'outline';

export function getModeBadgeVariant(mode: GameMode): BadgeVariant {
  if (mode === 'daily') return 'gold';
  if (mode === 'sprint') return 'warning';
  if (mode === 'blind') return 'neutral';
  return 'outline';
}

export function getTrendBadgeVariant(tone: PersonalTrend['tone']): BadgeVariant {
  if (tone === 'success') return 'success';
  if (tone === 'warning') return 'warning';
  return 'outline';
}


export function getMetaNumber(
  meta: Record<string, unknown> | null | undefined,
  key: string,
): number | null {
  const value = meta?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function getMetaString(
  meta: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value = meta?.[key];
  return typeof value === 'string' ? value : null;
}

export interface RoundInsight {
  round: number;
  result: RoundResult;
}

export interface ResultStats {
  rounds: number;
  correctMaps: number;
  wrongMaps: number;
  timeouts: number;
  mapAccuracyPct: number;
  currentStreak: number;
  bestStreak: number;
  best: RoundInsight | null;
  toughest: RoundInsight | null;
  advice: string;
}

export interface PersonalModeStat {
  mode: GameMode;
  games: number;
  bestScoreM: number;
  avgScoreM: number;
  bestRatio: number;
}

export interface PersonalRecentScore {
  id: string;
  mode: GameMode;
  scoreM: number;
  rounds: number | null;
  mapAccuracyPct: number | null;
  dailyKey: string | null;
  createdAt: string;
  ratio: number;
}

export interface PersonalTrend {
  label: string;
  detail: string;
  tone: 'success' | 'warning' | 'neutral';
}

export interface PersonalStats {
  games: number;
  gamesLast7Days: number;
  bestScoreM: number | null;
  avgScoreM: number | null;
  avgMapAccuracyPct: number | null;
  bestStreak: number;
  bestMode: PersonalModeStat | null;
  modes: PersonalModeStat[];
  recent: PersonalRecentScore[];
  trend: PersonalTrend | null;
}

export function summarizeResults(results: RoundResult[]): ResultStats {
  let best: RoundInsight | null = null;
  let toughest: RoundInsight | null = null;
  let correctMaps = 0;
  let wrongMaps = 0;
  let timeouts = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  results.forEach((result, index) => {
    const current = { round: index + 1, result };
    if (result.correctMap) {
      correctMaps += 1;
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
    if (result.kind === 'wrong-map') wrongMaps += 1;
    if (result.kind === 'timeout') timeouts += 1;

    if (
      result.kind === 'distance' &&
      result.distanceM != null &&
      (!best || result.distanceM < (best.result.distanceM ?? Infinity))
    ) {
      best = current;
    }

    if (!toughest || result.score > toughest.result.score) {
      toughest = current;
    }
  });

  const rounds = results.length;
  const mapAccuracyPct =
    rounds > 0 ? Math.round((correctMaps / rounds) * 100) : 0;

  return {
    rounds,
    correctMaps,
    wrongMaps,
    timeouts,
    mapAccuracyPct,
    currentStreak,
    bestStreak,
    best,
    toughest,
    advice: buildResultAdvice({
      rounds,
      correctMaps,
      wrongMaps,
      timeouts,
      best,
    }),
  };
}

export function buildResultAdvice({
  rounds,
  correctMaps,
  wrongMaps,
  timeouts,
  best,
}: Pick<
  ResultStats,
  'rounds' | 'correctMaps' | 'wrongMaps' | 'timeouts' | 'best'
>): string {
  if (rounds === 0) return 'Lance une partie pour obtenir une lecture utile.';
  if (timeouts > 0) {
    return 'Pose un point approximatif dès que tu as une intuition : même imparfait, un pick joué bat souvent un time out.';
  }
  if (wrongMaps >= Math.ceil(rounds / 2)) {
    return "Travaille d'abord la silhouette des minimaps : chemins de fer, lignes d'eau et gros reliefs donnent souvent la map avant les détails.";
  }
  if (correctMaps < rounds) {
    return 'Tu lis déjà plusieurs maps. Pour gratter des mètres, repère les spawns, bases et couloirs de tir visibles sur le screen.';
  }
  if (best?.result.distanceM != null && best.result.distanceM < 100) {
    return 'Très propre : garde cette méthode, puis cherche les micro-repères pour stabiliser les manches plus dures.';
  }
  return 'Bonne lecture globale. Le prochain palier se joue sur la précision du pin, pas seulement sur le choix de map.';
}

export function buildRoundFeedback(result: RoundResult): string {
  if (result.kind === 'timeout') {
    return 'Même sans certitude, pose un point tôt : tu peux toujours le déplacer avant de valider.';
  }
  if (result.kind === 'wrong-map') {
    return 'Mauvaise map : compare les grands repères de minimap avant les détails du screenshot.';
  }
  if (
    result.selectedX == null ||
    result.selectedY == null ||
    result.distanceM == null
  ) {
    return 'Bonne map. Rejoue les zones autour des bases pour gagner en précision.';
  }

  const dx = result.selectedX - result.shot.x_pct;
  const dy = result.selectedY - result.shot.y_pct;
  const horizontal =
    Math.abs(dx) < 0.06 ? null : dx > 0 ? "à l'est" : "à l'ouest";
  const vertical =
    Math.abs(dy) < 0.06 ? null : dy > 0 ? 'au sud' : 'au nord';
  const direction = [vertical, horizontal].filter(Boolean).join(' et ');

  if (result.distanceM < 80) {
    return 'Excellent placement : tu as identifié la bonne zone et les micro-repères.';
  }
  if (direction) {
    return `Bonne map, mais ton point est trop ${direction}. Recale-toi avec les bases, reliefs et lignes de tir.`;
  }
  return 'Bonne map : tu es dans le bon secteur, il manque surtout un repère fin pour verrouiller le pin.';
}

export function summarizePlayerScores(entries: LeaderboardEntry[]): PersonalStats {
  const parsed = entries
    .map((entry) => {
      const scoreM =
        getMetaNumber(entry.meta, 'distance_m') ??
        Math.max(0, entry.max_score - entry.score);
      return {
        entry,
        mode: getEntryGameMode(entry),
        scoreM,
        rounds: getMetaNumber(entry.meta, 'rounds'),
        mapAccuracyPct: getMetaNumber(entry.meta, 'map_accuracy_pct'),
        dailyKey: getMetaString(entry.meta, 'daily_key'),
        bestStreak: getMetaNumber(entry.meta, 'best_streak') ?? 0,
        createdMs: new Date(entry.created_at).getTime(),
      };
    })
    .filter((item) => Number.isFinite(item.scoreM))
    .sort((a, b) => b.createdMs - a.createdMs);

  if (parsed.length === 0) {
    return {
      games: 0,
      gamesLast7Days: 0,
      bestScoreM: null,
      avgScoreM: null,
      avgMapAccuracyPct: null,
      bestStreak: 0,
      bestMode: null,
      modes: [],
      recent: [],
      trend: null,
    };
  }

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const mapAccuracyValues = parsed
    .map((item) => item.mapAccuracyPct)
    .filter((value): value is number => value != null);
  const modes = new Map<GameMode, typeof parsed>();
  for (const item of parsed) {
    const list = modes.get(item.mode) ?? [];
    list.push(item);
    modes.set(item.mode, list);
  }
  const modeStats = [...modes.entries()]
    .map(([mode, items]) => ({
      mode,
      games: items.length,
      bestScoreM: Math.min(...items.map((item) => item.scoreM)),
      avgScoreM:
        items.reduce((acc, item) => acc + item.scoreM, 0) / items.length,
      bestRatio: Math.max(...items.map((item) => item.entry.ratio)),
    }))
    .sort((a, b) => b.bestRatio - a.bestRatio || b.games - a.games);

  return {
    games: parsed.length,
    gamesLast7Days: parsed.filter((item) => item.createdMs >= weekAgo).length,
    bestScoreM: Math.min(...parsed.map((item) => item.scoreM)),
    avgScoreM:
      parsed.reduce((acc, item) => acc + item.scoreM, 0) / parsed.length,
    avgMapAccuracyPct:
      mapAccuracyValues.length > 0
        ? Math.round(
            mapAccuracyValues.reduce((acc, value) => acc + value, 0) /
              mapAccuracyValues.length,
          )
        : null,
    bestStreak: Math.max(...parsed.map((item) => item.bestStreak)),
    bestMode: modeStats[0] ?? null,
    modes: modeStats,
    recent: parsed.slice(0, 5).map((item) => ({
      id: item.entry.id,
      mode: item.mode,
      scoreM: item.scoreM,
      rounds: item.rounds,
      mapAccuracyPct: item.mapAccuracyPct,
      dailyKey: item.dailyKey,
      createdAt: item.entry.created_at,
      ratio: item.entry.ratio,
    })),
    trend: buildPersonalTrend(parsed),
  };
}

export function buildPersonalTrend(
  parsed: Array<{ scoreM: number; createdMs: number }>,
): PersonalTrend | null {
  if (parsed.length < 6) return null;
  const recent = parsed.slice(0, 5);
  const previous = parsed.slice(5, 10);
  if (previous.length < 3) return null;
  const recentAvg =
    recent.reduce((acc, item) => acc + item.scoreM, 0) / recent.length;
  const previousAvg =
    previous.reduce((acc, item) => acc + item.scoreM, 0) / previous.length;
  if (previousAvg <= 0) return null;
  const deltaPct = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
  if (deltaPct <= -5) {
    return {
      label: 'En progrès',
      detail: `${Math.abs(deltaPct)}% de distance en moins sur tes 5 dernières parties.`,
      tone: 'success',
    };
  }
  if (deltaPct >= 8) {
    return {
      label: 'À stabiliser',
      detail: `${deltaPct}% de distance en plus récemment. Rejoue tes modes forts.`,
      tone: 'warning',
    };
  }
  return {
    label: 'Stable',
    detail: 'Tes 5 dernières parties restent dans ton rythme habituel.',
    tone: 'neutral',
  };
}

export function getEntryGameMode(entry: LeaderboardEntry): GameMode {
  const metaMode = getMetaString(entry.meta, 'game_mode');
  if (
    metaMode === 'daily' ||
    metaMode === 'random' ||
    metaMode === 'sprint' ||
    metaMode === 'blind'
  ) {
    return metaMode;
  }
  if (entry.submode.startsWith('daily:')) return 'daily';
  if (entry.submode.startsWith('sprint:')) return 'sprint';
  if (entry.submode.startsWith('blind:')) return 'blind';
  return 'random';
}

// ---------------------------------------------------------------------------
// Leaderboard helpers
// ---------------------------------------------------------------------------

export function isLeaderboardEntryMe(
  entry: LeaderboardEntry,
  me: ReturnType<typeof usePlayerIdentity>,
): boolean {
  return (
    (me.isVerified &&
      entry.is_verified &&
      entry.player_account_id === me.accountId) ||
    (!me.isVerified &&
      !entry.is_verified &&
      entry.player_anon_id === me.id)
  );
}

export function dedupeLeaderboardEntries(
  entries: LeaderboardEntry[],
): LeaderboardEntry[] {
  const bestByPlayer = new Map<string, LeaderboardEntry>();
  for (const entry of entries) {
    const key =
      entry.is_verified && entry.player_account_id != null
        ? `wg:${entry.player_account_id}`
        : `anon:${entry.player_anon_id}`;
    if (!bestByPlayer.has(key)) {
      bestByPlayer.set(key, entry);
    }
  }
  return [...bestByPlayer.values()];
}

export function formatScoreDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
