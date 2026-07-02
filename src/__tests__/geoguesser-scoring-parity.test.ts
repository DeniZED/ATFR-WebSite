// Vérifie que la copie serveur (netlify/functions/_geoguesser-scoring.ts)
// reste fonctionnellement identique à l'original client
// (src/features/geoguesser/scoring.ts) pour les fonctions de scoring pures.
// Les deux fichiers sont dupliqués (netlify/functions ne dépend pas de src/) ;
// ce test détecte toute dérive entre les deux copies.
import { describe, it, expect } from 'vitest';
import * as client from '../features/geoguesser/scoring';
import * as server from '../../netlify/functions/_geoguesser-scoring';

describe('geoguesser scoring parity (client vs server)', () => {
  const settings = { wrongMapMalusM: 2000, timeoutMalusM: 2000 };

  it('roundScore: timeout', () => {
    const input = { correctMap: false, hasPick: false, distanceM: 0, settings };
    expect(server.roundScore(input)).toEqual(client.roundScore(input));
  });

  it('roundScore: wrong map', () => {
    const input = { correctMap: false, hasPick: true, distanceM: 123, settings };
    expect(server.roundScore(input)).toEqual(client.roundScore(input));
  });

  it('roundScore: distance', () => {
    for (const distanceM of [0, 12.4, 345.6, 999.5]) {
      const input = { correctMap: true, hasPick: true, distanceM, settings };
      expect(server.roundScore(input)).toEqual(client.roundScore(input));
    }
  });

  it('realDistanceM matches across a range of points/dimensions', () => {
    const cases: [{ x: number; y: number }, { x: number; y: number }, number, number][] = [
      [{ x: 0, y: 0 }, { x: 1, y: 1 }, 1000, 1000],
      [{ x: 0.25, y: 0.75 }, { x: 0.8, y: 0.1 }, 800, 600],
      [{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, 500, 500],
      [{ x: 0, y: 1 }, { x: 1, y: 0 }, 0, 0],
    ];
    for (const [a, b, w, h] of cases) {
      expect(server.realDistanceM(a, b, w, h)).toBe(client.realDistanceM(a, b, w, h));
    }
  });

  it('diagonalM matches across a range of dimensions', () => {
    for (const [w, h] of [[1000, 1000], [800, 600], [0, 0], [1234, 56]]) {
      expect(server.diagonalM(w, h)).toBe(client.diagonalM(w, h));
    }
  });

  it('worstTotalFor matches', () => {
    for (const rounds of [1, 5, 10]) {
      expect(server.worstTotalFor(rounds, settings)).toBe(client.worstTotalFor(rounds, settings));
    }
  });
});
