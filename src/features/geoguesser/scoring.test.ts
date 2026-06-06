import { describe, it, expect } from 'vitest';
import {
  roundScore,
  worstTotalFor,
  formatDistance,
  scoreTier,
  realDistanceM,
  diagonalM,
} from './scoring';

const S = { wrongMapMalusM: 500, timeoutMalusM: 600 };

describe('roundScore', () => {
  it('returns timeout malus when no pick was placed', () => {
    const r = roundScore({ correctMap: false, hasPick: false, distanceM: 0, settings: S });
    expect(r.score).toBe(600);
    expect(r.kind).toBe('timeout');
  });

  it('returns wrong-map malus when wrong map is selected', () => {
    const r = roundScore({ correctMap: false, hasPick: true, distanceM: 0, settings: S });
    expect(r.score).toBe(500);
    expect(r.kind).toBe('wrong-map');
  });

  it('returns rounded distance when map and pick are correct', () => {
    const r = roundScore({ correctMap: true, hasPick: true, distanceM: 123.7, settings: S });
    expect(r.score).toBe(124);
    expect(r.kind).toBe('distance');
  });

  it('clamps negative distance to 0', () => {
    const r = roundScore({ correctMap: true, hasPick: true, distanceM: -5, settings: S });
    expect(r.score).toBe(0);
  });

  it('returns 0 for a perfect pin', () => {
    const r = roundScore({ correctMap: true, hasPick: true, distanceM: 0, settings: S });
    expect(r.score).toBe(0);
    expect(r.kind).toBe('distance');
  });
});

describe('worstTotalFor', () => {
  it('uses max of wrongMap/timeout malus per round', () => {
    expect(worstTotalFor(5, S)).toBe(5 * 600);
  });

  it('uses wrongMap malus when it is higher', () => {
    expect(worstTotalFor(3, { wrongMapMalusM: 1000, timeoutMalusM: 400 })).toBe(3000);
  });
});

describe('formatDistance', () => {
  it('formats metres below 1 000', () => {
    expect(formatDistance(0)).toBe('0 m');
    expect(formatDistance(42)).toBe('42 m');
    expect(formatDistance(999)).toBe('999 m');
  });

  it('formats kilometres with comma decimal', () => {
    expect(formatDistance(1000)).toBe('1,00 km');
    expect(formatDistance(1500)).toBe('1,50 km');
    expect(formatDistance(12345)).toBe('12,35 km');
  });

  it('returns dash for invalid values', () => {
    expect(formatDistance(-1)).toBe('—');
    expect(formatDistance(NaN)).toBe('—');
    expect(formatDistance(Infinity)).toBe('—');
  });
});

describe('scoreTier', () => {
  it('assigns best tier for avg < 80 m', () => {
    expect(scoreTier(0).title).toBe('Boussole humaine');
    expect(scoreTier(79).title).toBe('Boussole humaine');
  });

  it('assigns cartographe tier for avg < 200 m', () => {
    expect(scoreTier(80).title).toBe('Cartographe ATFR');
    expect(scoreTier(199).title).toBe('Cartographe ATFR');
  });

  it('assigns worst tier for avg >= 600 m', () => {
    expect(scoreTier(600).title).toBe('Bot dépisté');
    expect(scoreTier(9999).title).toBe('Bot dépisté');
  });
});

describe('realDistanceM', () => {
  it('computes full-width horizontal distance', () => {
    const d = realDistanceM({ x: 0, y: 0.5 }, { x: 1, y: 0.5 }, 1000, 1000);
    expect(d).toBe(1000);
  });

  it('returns 0 for identical points', () => {
    expect(realDistanceM({ x: 0.3, y: 0.7 }, { x: 0.3, y: 0.7 }, 800, 800)).toBe(0);
  });

  it('computes diagonal distance correctly', () => {
    const d = realDistanceM({ x: 0, y: 0 }, { x: 1, y: 1 }, 1000, 1000);
    expect(d).toBeCloseTo(Math.hypot(1000, 1000), 0);
  });
});

describe('diagonalM', () => {
  it('computes map diagonal', () => {
    expect(diagonalM(1000, 1000)).toBeCloseTo(Math.hypot(1000, 1000), 0);
  });

  it('clamps zero dimensions to 1', () => {
    expect(diagonalM(0, 0)).toBeCloseTo(Math.hypot(1, 1), 5);
  });
});
