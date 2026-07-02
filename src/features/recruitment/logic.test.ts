import { describe, it, expect } from 'vitest';
import { meetsRecruitmentThresholds, meetsWn8Threshold } from './logic';

describe('meetsRecruitmentThresholds', () => {
  const thresholds = { minWn8: 1500, minBattles: 5000 };

  it('accepte un joueur au-dessus des deux seuils', () => {
    expect(meetsRecruitmentThresholds({ wn8: 1600, battles: 6000 }, thresholds)).toBe(true);
  });

  it('accepte pile aux seuils', () => {
    expect(meetsRecruitmentThresholds({ wn8: 1500, battles: 5000 }, thresholds)).toBe(true);
  });

  it('refuse sous le seuil WN8', () => {
    expect(meetsRecruitmentThresholds({ wn8: 1499, battles: 6000 }, thresholds)).toBe(false);
  });

  it('refuse sous le seuil de batailles', () => {
    expect(meetsRecruitmentThresholds({ wn8: 1600, battles: 4999 }, thresholds)).toBe(false);
  });

  it('WN8 inconnu = 0 : refusé dès qu\'un seuil WN8 est fixé', () => {
    expect(meetsRecruitmentThresholds({ wn8: null, battles: 6000 }, thresholds)).toBe(false);
  });

  it('WN8 inconnu accepté si le seuil WN8 est 0', () => {
    expect(
      meetsRecruitmentThresholds({ wn8: null, battles: 6000 }, { minWn8: 0, minBattles: 5000 }),
    ).toBe(true);
  });
});

describe('meetsWn8Threshold', () => {
  it('sans seuil, tout passe (y compris WN8 inconnu)', () => {
    expect(meetsWn8Threshold(null, null)).toBe(true);
    expect(meetsWn8Threshold(1200, null)).toBe(true);
  });

  it('avec seuil, compare le WN8', () => {
    expect(meetsWn8Threshold(1500, 1500)).toBe(true);
    expect(meetsWn8Threshold(1499, 1500)).toBe(false);
  });

  it('avec seuil, un WN8 inconnu est exclu', () => {
    expect(meetsWn8Threshold(null, 1500)).toBe(false);
    expect(meetsWn8Threshold(undefined, 1500)).toBe(false);
  });

  it('seuil non fini traité comme absent', () => {
    expect(meetsWn8Threshold(null, Number.NaN)).toBe(true);
  });
});
