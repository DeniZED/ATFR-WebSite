import { describe, it, expect } from 'vitest';
import { isChunkLoadError } from '@/lib/chunk-error';

describe('isChunkLoadError', () => {
  it('détecte les échecs de chargement de module dynamique (chunk périmé)', () => {
    const cases = [
      new Error('Failed to fetch dynamically imported module: https://x/assets/Home-abc.js'),
      new Error('error loading dynamically imported module'),
      new Error('Importing a module script failed.'),
      new TypeError('Failed to fetch'),
      new Error('Loading chunk 42 failed.'),
    ];
    for (const err of cases) {
      expect(isChunkLoadError(err)).toBe(true);
    }
  });

  it('ne classe pas une erreur applicative ordinaire comme un échec de chunk', () => {
    expect(isChunkLoadError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isChunkLoadError(new Error('RLS policy violation'))).toBe(false);
    expect(isChunkLoadError('boom')).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
  });
});
