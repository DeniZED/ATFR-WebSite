import { describe, it, expect } from 'vitest';
import type { LeaderboardEntry } from '@/features/leaderboard/queries';
import type { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import type { ShotWithMap } from './queries';
import {
  buildPersonalTrend,
  buildResultAdvice,
  buildRoundFeedback,
  dedupeLeaderboardEntries,
  formatScoreDate,
  getEntryGameMode,
  getMetaNumber,
  getMetaString,
  getModeBadgeVariant,
  getTrendBadgeVariant,
  isLeaderboardEntryMe,
  summarizePlayerScores,
  summarizeResults,
  type RoundResult,
} from './resultStats';

type Identity = ReturnType<typeof usePlayerIdentity>;

function round(over: Partial<RoundResult>): RoundResult {
  return {
    shot: { x_pct: 0.5, y_pct: 0.5 } as ShotWithMap,
    selectedMapId: 'm1',
    selectedX: 0.5,
    selectedY: 0.5,
    correctMap: true,
    distanceM: 500,
    score: 500,
    baseScore: 500,
    timePenalty: 0,
    elapsedSeconds: 10,
    kind: 'distance',
    ...over,
  };
}

function entry(over: Partial<LeaderboardEntry>): LeaderboardEntry {
  return {
    id: 'x',
    module_slug: 'wot-geoguesser',
    submode: 'default',
    score: 0,
    max_score: 10000,
    player_anon_id: 'a',
    player_nickname: 'n',
    player_account_id: null,
    is_verified: false,
    meta: {},
    created_at: '2026-07-01T12:00:00Z',
    ratio: 0,
    ...over,
  } as LeaderboardEntry;
}

describe('badges', () => {
  it('variante par mode et par tendance', () => {
    expect(getModeBadgeVariant('daily')).toBe('gold');
    expect(getModeBadgeVariant('sprint')).toBe('warning');
    expect(getModeBadgeVariant('blind')).toBe('neutral');
    expect(getModeBadgeVariant('random')).toBe('outline');
    expect(getTrendBadgeVariant('success')).toBe('success');
    expect(getTrendBadgeVariant('neutral')).toBe('outline');
  });
});

describe('getMetaNumber / getMetaString', () => {
  it('ne retourne que des valeurs bien typées et finies', () => {
    expect(getMetaNumber({ a: 3 }, 'a')).toBe(3);
    expect(getMetaNumber({ a: Number.NaN }, 'a')).toBeNull();
    expect(getMetaNumber({ a: '3' }, 'a')).toBeNull();
    expect(getMetaNumber(null, 'a')).toBeNull();
    expect(getMetaString({ a: 'x' }, 'a')).toBe('x');
    expect(getMetaString({ a: 3 }, 'a')).toBeNull();
  });
});

describe('summarizeResults', () => {
  it('série vide : zéros et conseil de démarrage', () => {
    const s = summarizeResults([]);
    expect(s.rounds).toBe(0);
    expect(s.mapAccuracyPct).toBe(0);
    expect(s.best).toBeNull();
    expect(s.toughest).toBeNull();
    expect(s.advice).toContain('Lance une partie');
  });

  it('agrège précision, séries et meilleures/pires manches', () => {
    const s = summarizeResults([
      round({ distanceM: 120, score: 120 }),
      round({ distanceM: 60, score: 60 }),
      round({ correctMap: false, kind: 'wrong-map', distanceM: null, score: 2000 }),
      round({ distanceM: 300, score: 300 }),
    ]);
    expect(s.rounds).toBe(4);
    expect(s.correctMaps).toBe(3);
    expect(s.wrongMaps).toBe(1);
    expect(s.timeouts).toBe(0);
    expect(s.mapAccuracyPct).toBe(75);
    expect(s.bestStreak).toBe(2);
    expect(s.currentStreak).toBe(1);
    // best = plus petite distance en manche « distance »
    expect(s.best?.round).toBe(2);
    // toughest = plus gros score (lower-is-better)
    expect(s.toughest?.round).toBe(3);
  });
});

describe('buildResultAdvice', () => {
  const base = { rounds: 5, correctMaps: 5, wrongMaps: 0, timeouts: 0, best: null };

  it('priorise le conseil anti-timeout', () => {
    expect(buildResultAdvice({ ...base, timeouts: 1 })).toContain('time out');
  });

  it('conseille la lecture de minimap quand la moitié des maps est fausse', () => {
    expect(buildResultAdvice({ ...base, correctMaps: 2, wrongMaps: 3 })).toContain('silhouette');
  });

  it('sans-faute très précis vs sans-faute standard', () => {
    const best = { round: 1, result: round({ distanceM: 50 }) };
    expect(buildResultAdvice({ ...base, best })).toContain('Très propre');
    expect(buildResultAdvice(base)).toContain('précision du pin');
  });
});

describe('buildRoundFeedback', () => {
  it('messages timeout / mauvaise map / bonne map sans pick', () => {
    expect(buildRoundFeedback(round({ kind: 'timeout' }))).toContain('pose un point');
    expect(buildRoundFeedback(round({ kind: 'wrong-map' }))).toContain('Mauvaise map');
    expect(buildRoundFeedback(round({ selectedX: null, distanceM: null }))).toContain('Bonne map');
  });

  it('placement excellent sous 80 m', () => {
    expect(buildRoundFeedback(round({ distanceM: 60 }))).toContain('Excellent placement');
  });

  it('indique la direction de l’erreur (sud/est) au-delà du seuil', () => {
    const feedback = buildRoundFeedback(
      round({ distanceM: 300, selectedX: 0.6, selectedY: 0.6 }),
    );
    expect(feedback).toContain('au sud');
    expect(feedback).toContain("à l'est");
  });

  it('bon secteur quand l’écart est sous le seuil directionnel', () => {
    expect(
      buildRoundFeedback(round({ distanceM: 150, selectedX: 0.52, selectedY: 0.52 })),
    ).toContain('bon secteur');
  });
});

describe('summarizePlayerScores', () => {
  it('aucune entrée : stats vides', () => {
    const s = summarizePlayerScores([]);
    expect(s.games).toBe(0);
    expect(s.bestScoreM).toBeNull();
    expect(s.trend).toBeNull();
  });

  it('lit distance_m du meta et retombe sur max_score - score sinon', () => {
    const s = summarizePlayerScores([
      entry({ id: 'a', meta: { distance_m: 900, game_mode: 'daily' }, ratio: 0.9 }),
      entry({ id: 'b', score: 9600, max_score: 10000, meta: {} }),
    ]);
    expect(s.games).toBe(2);
    expect(s.bestScoreM).toBe(400);
    expect(s.avgScoreM).toBe(650);
    // meilleur mode = meilleur ratio
    expect(s.bestMode?.mode).toBe('daily');
    expect(s.recent).toHaveLength(2);
  });
});

describe('buildPersonalTrend', () => {
  function series(scores: number[]): Array<{ scoreM: number; createdMs: number }> {
    return scores.map((scoreM, i) => ({ scoreM, createdMs: 1000 - i }));
  }

  it('null sous 6 parties ou avec un historique trop court', () => {
    expect(buildPersonalTrend(series([1, 2, 3, 4, 5]))).toBeNull();
    // 6 parties → fenêtre précédente d'une seule partie (< 3) → null
    expect(buildPersonalTrend(series([1, 1, 1, 1, 1, 1]))).toBeNull();
  });

  it('en progrès quand la distance récente baisse d’au moins 5 %', () => {
    const trend = buildPersonalTrend(series([800, 800, 800, 800, 800, 1000, 1000, 1000]));
    expect(trend?.tone).toBe('success');
    expect(trend?.label).toBe('En progrès');
  });

  it('à stabiliser quand la distance récente monte d’au moins 8 %', () => {
    const trend = buildPersonalTrend(series([1100, 1100, 1100, 1100, 1100, 1000, 1000, 1000]));
    expect(trend?.tone).toBe('warning');
  });

  it('stable entre les deux seuils', () => {
    const trend = buildPersonalTrend(series([1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]));
    expect(trend?.tone).toBe('neutral');
  });
});

describe('getEntryGameMode', () => {
  it('meta game_mode prioritaire, sinon préfixe du submode, sinon random', () => {
    expect(getEntryGameMode(entry({ meta: { game_mode: 'blind' } }))).toBe('blind');
    expect(getEntryGameMode(entry({ submode: 'daily:2026-07-10:default:5' }))).toBe('daily');
    expect(getEntryGameMode(entry({ submode: 'sprint:default:10' }))).toBe('sprint');
    expect(getEntryGameMode(entry({ submode: 'easy' }))).toBe('random');
  });
});

describe('leaderboard helpers', () => {
  it('dedupeLeaderboardEntries garde la première entrée par joueur (WG vs anonyme)', () => {
    const deduped = dedupeLeaderboardEntries([
      entry({ id: '1', is_verified: true, player_account_id: 42 }),
      entry({ id: '2', is_verified: true, player_account_id: 42 }),
      entry({ id: '3', player_anon_id: 'anon-a' }),
      entry({ id: '4', player_anon_id: 'anon-a' }),
      entry({ id: '5', player_anon_id: 'anon-b' }),
    ]);
    expect(deduped.map((e) => e.id)).toEqual(['1', '3', '5']);
  });

  it('isLeaderboardEntryMe ne mélange pas identités vérifiées et anonymes', () => {
    const verifiedMe = { isVerified: true, accountId: 42, id: 'anon-a' } as Identity;
    const anonMe = { isVerified: false, accountId: null, id: 'anon-a' } as Identity;
    expect(
      isLeaderboardEntryMe(entry({ is_verified: true, player_account_id: 42 }), verifiedMe),
    ).toBe(true);
    expect(isLeaderboardEntryMe(entry({ player_anon_id: 'anon-a' }), verifiedMe)).toBe(false);
    expect(isLeaderboardEntryMe(entry({ player_anon_id: 'anon-a' }), anonMe)).toBe(true);
    expect(
      isLeaderboardEntryMe(entry({ is_verified: true, player_account_id: 42 }), anonMe),
    ).toBe(false);
  });

  it('formatScoreDate : chaîne vide pour une date invalide', () => {
    expect(formatScoreDate('nimp')).toBe('');
    expect(formatScoreDate('2026-07-01T12:00:00Z')).toMatch(/\d/);
  });
});
