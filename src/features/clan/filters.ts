// Libellés de filtres UI des pages clan — volontairement conservés côté
// client (P0-2) : ce sont des étiquettes génériques sans valeur tactique,
// contrairement au contenu servi par clan-content (voir contentQueries.ts).

export const LINK_CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'stats', label: 'Stats joueurs' },
  { id: 'comparaison', label: 'Comparaison' },
  { id: 'blindage', label: 'Blindage' },
  { id: 'maps', label: 'Maps' },
  { id: 'officiel', label: 'Officiel WG' },
  { id: 'clan', label: 'Clan / CW' },
  { id: 'interne', label: 'Ressources ATFR' },
] as const;

export const MAP_FILTERS = [
  { id: 'all', label: 'Toutes' },
  { id: 'cw', label: 'CW' },
  { id: 'bastion', label: 'Bastion' },
  { id: 'offensive', label: 'Offensive' },
  { id: 'vision', label: 'Vision' },
  { id: 'urbaine', label: 'Urbaine' },
  { id: 'push', label: 'Push' },
  { id: 'hulldown', label: 'Hulldown' },
] as const;

export const STRATEGY_CATEGORIES = [
  { id: 'all', label: 'Toutes' },
  { id: 'focus-fire', label: 'Focus fire' },
  { id: 'push', label: 'Push' },
  { id: 'trade', label: 'Trade' },
  { id: 'rotation', label: 'Rotation' },
  { id: 'hp', label: 'Gestion HP' },
  { id: 'reset', label: 'Reset cap' },
  { id: 'crossfire', label: 'Crossfire' },
  { id: 'vocal', label: 'Vocal' },
] as const;
