import { describe, it, expect } from 'vitest';
import {
  getMetallicType,
  getStarCount,
  getTier,
  darken,
  lighten,
  specularExponent,
  toRoman,
} from './badge';

describe('getTier / getStarCount', () => {
  it('bornes des tiers', () => {
    expect(getTier(1)).toBe(1);
    expect(getTier(3)).toBe(1);
    expect(getTier(4)).toBe(2);
    expect(getTier(6)).toBe(2);
    expect(getTier(7)).toBe(3);
    expect(getTier(9)).toBe(3);
    expect(getTier(10)).toBe(4);
    expect(getTier(12)).toBe(4);
    expect(getTier(13)).toBe(5);
    expect(getTier(15)).toBe(5);
  });

  it('bornes des étoiles', () => {
    expect(getStarCount(3)).toBe(0);
    expect(getStarCount(4)).toBe(1);
    expect(getStarCount(5)).toBe(1);
    expect(getStarCount(6)).toBe(2);
    expect(getStarCount(7)).toBe(2);
    expect(getStarCount(8)).toBe(3);
    expect(getStarCount(10)).toBe(3);
    expect(getStarCount(11)).toBe(4);
    expect(getStarCount(12)).toBe(4);
    expect(getStarCount(13)).toBe(5);
  });
});

describe('toRoman', () => {
  it('convertit 1-15 et retombe sur le nombre au-delà', () => {
    expect(toRoman(1)).toBe('I');
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(15)).toBe('XV');
    expect(toRoman(16)).toBe('16');
  });
});

describe('lighten / darken', () => {
  it('lighten(x, 0) et darken(x, 0) sont identité', () => {
    expect(lighten('#123456', 0)).toBe('#123456');
    expect(darken('#123456', 0)).toBe('#123456');
  });

  it('lighten(x, 1) = blanc, darken(x, 1) = noir', () => {
    expect(lighten('#123456', 1)).toBe('#ffffff');
    expect(darken('#123456', 1)).toBe('#000000');
  });
});

describe('getMetallicType / specularExponent', () => {
  it('détecte les familles métalliques par id de couleur', () => {
    expect(getMetallicType('col-gold', null)).toBe('gold');
    expect(getMetallicType('col-red', 'acc-silver')).toBe('silver');
    expect(getMetallicType('col-iron', null)).toBe('iron');
    expect(getMetallicType('col-prestige', null)).toBe('iron');
    expect(getMetallicType('col-red', null)).toBeNull();
  });

  it("l'or prime sur l'argent quand les deux matchent (ordre historique)", () => {
    expect(getMetallicType('col-gold', 'acc-silver')).toBe('gold');
  });

  it('exposants spéculaires', () => {
    expect(specularExponent('silver', 1)).toBe(80);
    expect(specularExponent('gold', 1)).toBe(48);
    expect(specularExponent(null, 4)).toBe(28);
    expect(specularExponent(null, 3)).toBe(18);
  });
});
