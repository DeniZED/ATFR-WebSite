import { describe, it, expect } from 'vitest';
import { flattenNav, navGroups, topNav } from './adminNav';

describe('adminNav', () => {
  it('aplatit toutes les entrées en conservant leur groupe', () => {
    const flat = flattenNav();
    const expected =
      topNav.length + navGroups.reduce((n, g) => n + g.items.length, 0);
    expect(flat).toHaveLength(expected);
    expect(flat.every((item) => item.group.length > 0)).toBe(true);
  });

  it('n’a pas de route en double (clés de liste/palette uniques)', () => {
    const routes = flattenNav().map((item) => item.to);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('chaque entrée a un libellé et une route /admin', () => {
    for (const item of flattenNav()) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.to.startsWith('/admin')).toBe(true);
    }
  });
});
