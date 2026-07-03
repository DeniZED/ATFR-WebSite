import { describe, it, expect } from 'vitest';
import type { LeaderboardEntry } from '@/features/leaderboard/queries';
import { formatDist, parseMode, summariseGeoScores } from './personalStats';

const NOW = new Date('2026-07-01T12:00:00Z').getTime();

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
    created_at: new Date(NOW - 1000).toISOString(),
    ratio: 0,
    ...over,
  } as LeaderboardEntry;
}

describe('summariseGeoScores', () => {
  it('retourne null sans entrée', () => {
    expect(summariseGeoScores([], NOW)).toBeNull();
  });

  it('agrège distance/précision/série et compte la fenêtre 7 jours', () => {
    const entries = [
      entry({ meta: { distance_m: 1200, map_accuracy_pct: 80, best_streak: 3, game_mode: 'daily' } }),
      entry({
        meta: { distance_m: 800, map_accuracy_pct: 61, best_streak: 5, game_mode: 'sprint' },
        created_at: new Date(NOW - 10 * 24 * 3600 * 1000).toISOString(),
      }),
    ];
    const s = summariseGeoScores(entries, NOW)!;
    expect(s.total).toBe(2);
    expect(s.last7).toBe(1);
    expect(s.bestDist).toBe(800);
    expect(s.avgAccuracy).toBe(71); // (80+61)/2 = 70.5 → arrondi 71
    expect(s.bestStreak).toBe(5);
    expect(s.byMode).toEqual({ daily: 1, sprint: 1 });
  });

  it('sans meta distance_m, retombe sur max_score - score', () => {
    const s = summariseGeoScores([entry({ score: 9400, max_score: 10000, meta: {} })], NOW)!;
    expect(s.bestDist).toBe(600);
    expect(s.avgAccuracy).toBeNull();
  });
});

describe('parseMode', () => {
  it("retombe sur 'random' pour les anciens scores sans game_mode", () => {
    expect(parseMode(entry({ meta: {} }))).toBe('random');
    expect(parseMode(entry({ meta: { game_mode: 'blind' } }))).toBe('blind');
    expect(parseMode(entry({ meta: { game_mode: 'nimp' } }))).toBe('random');
  });
});

describe('formatDist', () => {
  it('mètres sous 1 km, km avec une décimale au-dessus', () => {
    expect(formatDist(999)).toBe('999 m');
    expect(formatDist(1500)).toBe('1.5 km');
  });
});
