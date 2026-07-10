// Barème WN8 canonique (P1-11) : paliers et libellés partagés par tout le
// site (`wn8Color`/`wn8Label` de tomato-api.ts). Le bot Discord
// (`discord-bot/src/clan/wn8.ts`) en garde une copie miroir — son tsconfig
// (`rootDir: "src"`) ne peut pas importer hors de son arbre — verrouillée par
// le test de parité `src/__tests__/wn8-scale-parity.test.ts` qui lit le
// fichier du bot et échoue à la moindre divergence de palier ou de libellé.

export interface Wn8Tier {
  /** Borne supérieure exclusive du palier ; null = palier ouvert (dernier). */
  max: number | null;
  label: string;
}

export const WN8_TIERS: readonly Wn8Tier[] = [
  { max: 300, label: 'Très faible' },
  { max: 600, label: 'Faible' },
  { max: 900, label: 'Moyen -' },
  { max: 1250, label: 'Moyen' },
  { max: 1600, label: 'Bon' },
  { max: 1900, label: 'Très bon' },
  { max: 2350, label: 'Excellent' },
  { max: 2900, label: 'Unicum' },
  { max: 3400, label: 'Super unicum' },
  { max: null, label: 'Légendaire' },
] as const;

/** Index du palier dont relève une valeur WN8 (dernier palier si au-delà). */
export function wn8TierIndex(wn8: number): number {
  const index = WN8_TIERS.findIndex((tier) => tier.max != null && wn8 < tier.max);
  return index === -1 ? WN8_TIERS.length - 1 : index;
}
