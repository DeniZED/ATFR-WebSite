import { describe, it, expect } from 'vitest';
import { DEFAULT_GEO_SETTINGS, type PublicShot } from './queries';
import {
  buildDifficultyAvailability,
  clampNumber,
  formatChallengeDate,
  formatDuration,
  formatGenericModeLabel,
  formatModeLabel,
  getBlindPreviewSeconds,
  getDailyChallengeKey,
  getFirstAvailableDifficulty,
  getLeaderboardSubmode,
  getMinMapRequirement,
  getModeSettings,
  getRoundTargetForMode,
  getRoundTimeLimit,
  getStartButtonLabel,
  getStartDisabledReason,
  getWorstTotalForMode,
  type DifficultyAvailability,
  type DifficultyFilter,
} from './mode';

const MODE_SETTINGS = getModeSettings(DEFAULT_GEO_SETTINGS);

function shot(over: Partial<PublicShot>): PublicShot {
  return {
    id: 's1',
    map_id: 'm1',
    image_url: 'https://example.test/s.jpg',
    difficulty: 'easy',
    caption: null,
    tags: [],
    is_published: true,
    sort_order: 0,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    ...over,
  };
}

describe('clampNumber', () => {
  it('arrondit et borne dans [min, max]', () => {
    expect(clampNumber(4.6, 1, 10)).toBe(5);
    expect(clampNumber(-3, 1, 10)).toBe(1);
    expect(clampNumber(42, 1, 10)).toBe(10);
  });

  it('retombe sur min pour NaN/Infinity', () => {
    expect(clampNumber(Number.NaN, 2, 10)).toBe(2);
    expect(clampNumber(Number.POSITIVE_INFINITY, 2, 10)).toBe(2);
  });
});

describe('getDailyChallengeKey', () => {
  it('utilise le fuseau Europe/Paris (UTC+1 en hiver)', () => {
    expect(getDailyChallengeKey(new Date('2026-01-15T23:30:00Z'))).toBe('2026-01-16');
    expect(getDailyChallengeKey(new Date('2026-01-15T12:00:00Z'))).toBe('2026-01-15');
  });
});

describe('formatChallengeDate', () => {
  it('formate la clé en JJ/MM et laisse passer les clés invalides', () => {
    expect(formatChallengeDate('2026-07-10')).toBe('10/07');
    expect(formatChallengeDate('nimp')).toBe('nimp');
  });
});

describe('getModeSettings', () => {
  it('reprend les valeurs des réglages par défaut', () => {
    expect(MODE_SETTINGS).toEqual({
      dailyRounds: 5,
      randomRounds: 5,
      sprintRounds: 10,
      sprintRoundTimeS: 20,
      sprintTimePenaltyM: 12,
      blindRounds: 5,
      blindPreviewSeconds: 5,
      minMapsDaily: 5,
      minMapsRandom: 5,
      minMapsSprint: 10,
      minMapsBlind: 5,
    });
  });

  it('borne les valeurs hors plage venant de la base', () => {
    const s = getModeSettings({
      ...DEFAULT_GEO_SETTINGS,
      daily_challenge_rounds: 0,
      sprint_round_time_s: 999,
      blind_preview_seconds: -3,
    });
    expect(s.dailyRounds).toBe(1);
    expect(s.sprintRoundTimeS).toBe(120);
    expect(s.blindPreviewSeconds).toBe(1);
  });
});

describe('sélecteurs par mode', () => {
  it('getRoundTargetForMode', () => {
    expect(getRoundTargetForMode('daily', MODE_SETTINGS)).toBe(5);
    expect(getRoundTargetForMode('sprint', MODE_SETTINGS)).toBe(10);
    expect(getRoundTargetForMode('blind', MODE_SETTINGS)).toBe(5);
    expect(getRoundTargetForMode('random', MODE_SETTINGS)).toBe(5);
  });

  it('getMinMapRequirement', () => {
    expect(getMinMapRequirement('sprint', MODE_SETTINGS)).toBe(10);
    expect(getMinMapRequirement('random', MODE_SETTINGS)).toBe(5);
  });

  it('getRoundTimeLimit : seul le sprint remplace le temps de manche', () => {
    expect(getRoundTimeLimit('sprint', 45, MODE_SETTINGS)).toBe(20);
    expect(getRoundTimeLimit('daily', 45, MODE_SETTINGS)).toBe(45);
  });

  it('getBlindPreviewSeconds : jamais plus long que la manche', () => {
    expect(getBlindPreviewSeconds(MODE_SETTINGS, 45)).toBe(5);
    expect(getBlindPreviewSeconds(MODE_SETTINGS, 3)).toBe(3);
  });
});

describe('getWorstTotalForMode', () => {
  const score = { wrongMapMalusM: 2000, timeoutMalusM: 2000 };

  it('hors sprint : pire total = manches × pire malus', () => {
    expect(getWorstTotalForMode('daily', 5, score, 45, MODE_SETTINGS)).toBe(10000);
  });

  it('sprint : prend le max avec le malus temps cumulé', () => {
    // base = 10 × 2000 = 20000 ; sprint = 10 × (2000 + 20 × 12) = 22400
    expect(getWorstTotalForMode('sprint', 10, score, 20, MODE_SETTINGS)).toBe(22400);
  });
});

describe('libellés', () => {
  it('formatModeLabel / formatGenericModeLabel / getStartButtonLabel', () => {
    expect(formatModeLabel('daily', '2026-07-10')).toBe('Défi 10/07');
    expect(formatModeLabel('random', '2026-07-10')).toBe('Série libre');
    expect(formatGenericModeLabel('daily')).toBe('Challenge du jour');
    expect(getStartButtonLabel('blind')).toBe('Lancer Blind Guess');
  });
});

describe('buildDifficultyAvailability', () => {
  it('compte maps distinctes et screenshots par difficulté', () => {
    const availability = buildDifficultyAvailability(
      [
        shot({ id: 'a', map_id: 'm1', difficulty: 'easy' }),
        shot({ id: 'b', map_id: 'm1', difficulty: 'easy' }),
        shot({ id: 'c', map_id: 'm2', difficulty: 'hard' }),
      ],
      2,
      2,
    );
    expect(availability.all).toEqual({
      mapCount: 2,
      shotCount: 3,
      requiredMapCount: 2,
      requiredShotCount: 2,
      disabled: false,
    });
    // 1 seule map easy → indisponible malgré 2 screenshots
    expect(availability.easy.mapCount).toBe(1);
    expect(availability.easy.disabled).toBe(true);
    expect(availability.medium.disabled).toBe(true);
  });

  it('liste vide : tout est indisponible dès qu’un minimum est requis', () => {
    const availability = buildDifficultyAvailability([], 1, 1);
    expect(availability.all.disabled).toBe(true);
  });
});

describe('getFirstAvailableDifficulty', () => {
  function avail(disabled: boolean): DifficultyAvailability {
    return { mapCount: 0, shotCount: 0, requiredMapCount: 0, requiredShotCount: 0, disabled };
  }

  it("préfère 'all' puis remonte easy → expert", () => {
    const base: Record<DifficultyFilter, DifficultyAvailability> = {
      all: avail(true),
      easy: avail(true),
      medium: avail(false),
      hard: avail(false),
      expert: avail(false),
    };
    expect(getFirstAvailableDifficulty(base)).toBe('medium');
    expect(getFirstAvailableDifficulty({ ...base, all: avail(false) })).toBe('all');
  });

  it('retourne null si tout est indisponible', () => {
    const all = avail(true);
    expect(
      getFirstAvailableDifficulty({ all, easy: all, medium: all, hard: all, expert: all }),
    ).toBeNull();
  });
});

describe('getStartDisabledReason', () => {
  const ok: DifficultyAvailability = {
    mapCount: 6, shotCount: 12, requiredMapCount: 5, requiredShotCount: 5, disabled: false,
  };

  it('exige un pseudo avant tout', () => {
    expect(getStartDisabledReason(false, ok)).toBe("Choisis d'abord un pseudo");
  });

  it('détaille la ressource manquante (maps ou screenshots)', () => {
    expect(
      getStartDisabledReason(true, { ...ok, disabled: true, mapCount: 2 }),
    ).toContain('5 maps minimum');
    expect(
      getStartDisabledReason(true, { ...ok, disabled: true, shotCount: 3 }),
    ).toContain('5 screenshots minimum');
  });

  it('null quand tout est disponible', () => {
    expect(getStartDisabledReason(true, ok)).toBeNull();
  });
});

describe('formatDuration', () => {
  it('formate en secondes puis minutes', () => {
    expect(formatDuration(59)).toBe('59s');
    expect(formatDuration(60)).toBe('1m 00s');
    expect(formatDuration(125)).toBe('2m 05s');
    expect(formatDuration(-3)).toBe('0s');
  });
});

describe('getLeaderboardSubmode', () => {
  it('daily : clé du jour + difficulté + nombre de manches', () => {
    expect(getLeaderboardSubmode('daily', 'all', '2026-07-10', 5, MODE_SETTINGS)).toBe(
      'daily:2026-07-10:default:5',
    );
    expect(getLeaderboardSubmode('daily', 'hard', '2026-07-10', 5, MODE_SETTINGS)).toBe(
      'daily:2026-07-10:hard:5',
    );
  });

  it('sprint / blind : difficulté + manches du mode', () => {
    expect(getLeaderboardSubmode('sprint', 'all', 'x', 5, MODE_SETTINGS)).toBe('sprint:default:10');
    expect(getLeaderboardSubmode('blind', 'easy', 'x', 5, MODE_SETTINGS)).toBe('blind:easy:5');
  });

  it('random : submode legacy quand 5 manches, préfixé sinon', () => {
    expect(getLeaderboardSubmode('random', 'all', 'x', 5, MODE_SETTINGS)).toBe('default');
    expect(getLeaderboardSubmode('random', 'easy', 'x', 5, MODE_SETTINGS)).toBe('easy');
    expect(
      getLeaderboardSubmode('random', 'easy', 'x', 5, { ...MODE_SETTINGS, randomRounds: 7 }),
    ).toBe('random:easy:7');
  });
});
