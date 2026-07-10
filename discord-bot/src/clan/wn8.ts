// Copie miroir du barème canonique `src/lib/wn8-scale.ts` (racine du repo,
// P1-11) — le tsconfig du bot (`rootDir: "src"`) ne peut pas l'importer.
// Toute modification doit partir du fichier canonique : le test de parité
// `src/__tests__/wn8-scale-parity.test.ts` lit ce fichier et échoue si les
// paliers ou libellés divergent.

const COLORS: Array<[number, number]> = [
  [300, 0x95a5a6],
  [600, 0xed4245],
  [900, 0xe67e22],
  [1250, 0xf1c40f],
  [1600, 0x9acd32],
  [1900, 0x2ecc71],
  [2350, 0x1abc9c],
  [2900, 0x5865f2],
  [3400, 0xeb459e],
];
const DEFAULT_COLOR = 0xff73c7;

const LABELS: Array<[number, string]> = [
  [300, 'Très faible'],
  [600, 'Faible'],
  [900, 'Moyen -'],
  [1250, 'Moyen'],
  [1600, 'Bon'],
  [1900, 'Très bon'],
  [2350, 'Excellent'],
  [2900, 'Unicum'],
  [3400, 'Super unicum'],
];
const DEFAULT_LABEL = 'Légendaire';

export function wn8Color(wn8: number | null): number {
  if (wn8 == null) return 0x95a5a6;
  for (const [threshold, color] of COLORS) if (wn8 < threshold) return color;
  return DEFAULT_COLOR;
}

export function wn8Label(wn8: number | null): string {
  if (wn8 == null) return '—';
  for (const [threshold, label] of LABELS) if (wn8 < threshold) return label;
  return DEFAULT_LABEL;
}
