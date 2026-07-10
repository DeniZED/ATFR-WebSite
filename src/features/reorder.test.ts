import { describe, it, expect } from 'vitest';
import { planReorder } from './reorder';
import { matchesSearch, normalizeSearchText } from '@/lib/text-search';

describe('planReorder', () => {
  const items = [
    { id: 'a', sort_order: 0 },
    { id: 'b', sort_order: 0 },
    { id: 'c', sort_order: 0 },
  ];

  it('null hors bornes', () => {
    expect(planReorder(items, 0, -1)).toBeNull();
    expect(planReorder(items, 2, 1)).toBeNull();
    expect(planReorder(items, 5, 1)).toBeNull();
  });

  it('descend un élément en renumérotant la liste affichée', () => {
    // a↓ : ordre affiché devient b, a, c — les égalités (tout à 0) sont
    // normalisées au passage, seules les lignes qui changent sont écrites.
    expect(planReorder(items, 0, 1)).toEqual([
      { id: 'a', sort_order: 1 },
      { id: 'c', sort_order: 2 },
    ]);
  });

  it('monte un élément déjà numéroté sans réécrire les lignes stables', () => {
    const numbered = [
      { id: 'a', sort_order: 0 },
      { id: 'b', sort_order: 1 },
      { id: 'c', sort_order: 2 },
    ];
    expect(planReorder(numbered, 2, -1)).toEqual([
      { id: 'c', sort_order: 1 },
      { id: 'b', sort_order: 2 },
    ]);
  });
});

describe('matchesSearch', () => {
  it('insensible à la casse et aux accents', () => {
    expect(normalizeSearchText('Évènement Été')).toBe('evenement ete');
    expect(matchesSearch('evenement', 'Grand Évènement CW')).toBe(true);
    expect(matchesSearch('ÉVÈNEMENT', 'grand evenement cw')).toBe(true);
  });

  it('requête vide = tout passe, champs null ignorés', () => {
    expect(matchesSearch('  ', null, undefined)).toBe(true);
    expect(matchesSearch('x', null, undefined)).toBe(false);
    expect(matchesSearch('tag', null, 'mon-tag')).toBe(true);
  });
});
