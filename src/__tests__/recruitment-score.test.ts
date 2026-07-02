import { describe, it, expect } from 'vitest';
import {
  DEFAULT_RECRUITMENT_SETTINGS,
  computeRecruitmentScore,
} from '../../netlify/functions/_recruitment-score';

describe('computeRecruitmentScore', () => {
  const settings = DEFAULT_RECRUITMENT_SETTINGS;

  it('joueur pile au milieu de chaque échelle → 50', () => {
    // wn8 1700/3400, winrate 51 (=42+18/2), battles 10000/20000, tier10 4/8 :
    // chaque facteur vaut 50, la moyenne pondérée aussi.
    const score = computeRecruitmentScore(
      { wn8: 1700, winRate: 51, battles: 10_000, tier10Count: 4 },
      settings,
    );
    expect(score).toBe(50);
  });

  it('joueur au plafond de chaque échelle → 100', () => {
    const score = computeRecruitmentScore(
      { wn8: 3400, winRate: 60, battles: 20_000, tier10Count: 8 },
      settings,
    );
    expect(score).toBe(100);
  });

  it('clampe au-dessus des plafonds (pas de score > 100)', () => {
    const score = computeRecruitmentScore(
      { wn8: 9000, winRate: 75, battles: 500_000, tier10Count: 30 },
      settings,
    );
    expect(score).toBe(100);
  });

  it('clampe en dessous des planchers (pas de score < 0)', () => {
    const score = computeRecruitmentScore(
      { wn8: 0, winRate: 30, battles: 0, tier10Count: 0 },
      settings,
    );
    expect(score).toBe(0);
  });

  it('un facteur sans donnée est exclu de la moyenne, pas pénalisant', () => {
    // Sans WN8, les trois facteurs restants sont au plafond → 100, alors
    // qu'un WN8 compté comme 0 aurait tiré la moyenne vers le bas.
    const score = computeRecruitmentScore(
      { wn8: null, winRate: 60, battles: 20_000, tier10Count: 8 },
      settings,
    );
    expect(score).toBe(100);
  });

  it('winRate null est également exclu', () => {
    const score = computeRecruitmentScore(
      { wn8: 3400, winRate: null, battles: 20_000, tier10Count: 8 },
      settings,
    );
    expect(score).toBe(100);
  });

  it('respecte la pondération des réglages', () => {
    // Tout le poids sur le WN8 : le score ne dépend que de lui.
    const wn8Only = { ...settings, weight_wn8: 100, weight_winrate: 0, weight_battles: 0, weight_tier10: 0 };
    const score = computeRecruitmentScore(
      { wn8: 1700, winRate: 60, battles: 20_000, tier10Count: 8 },
      wn8Only,
    );
    expect(score).toBe(50);
  });

  it('tous les poids à zéro → null (pas de division par zéro)', () => {
    const zero = { ...settings, weight_wn8: 0, weight_winrate: 0, weight_battles: 0, weight_tier10: 0 };
    const score = computeRecruitmentScore(
      { wn8: 1700, winRate: 51, battles: 10_000, tier10Count: 4 },
      zero,
    );
    expect(score).toBeNull();
  });

  it('seul facteur pondéré sans donnée → null', () => {
    // Tout le poids sur le WN8 mais WN8 inconnu : aucun facteur comptable.
    const wn8Only = { ...settings, weight_wn8: 100, weight_winrate: 0, weight_battles: 0, weight_tier10: 0 };
    const score = computeRecruitmentScore(
      { wn8: null, winRate: 51, battles: 10_000, tier10Count: 4 },
      wn8Only,
    );
    expect(score).toBeNull();
  });

  it('arrondit au plus proche', () => {
    // battles seul facteur : 12345/20000 = 61,725 → 62.
    const battlesOnly = { ...settings, weight_wn8: 0, weight_winrate: 0, weight_battles: 100, weight_tier10: 0 };
    const score = computeRecruitmentScore(
      { wn8: null, winRate: null, battles: 12_345, tier10Count: 0 },
      battlesOnly,
    );
    expect(score).toBe(62);
  });
});
