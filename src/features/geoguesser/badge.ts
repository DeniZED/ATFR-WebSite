// Logique métier de l'insigne Académie (P1-5) — extraite du composant de
// rendu AcademyBadge.tsx, à l'identique, pour être testable isolément.
// Seuils niveau → tier/étoiles, chiffres romains, calculs de couleur et
// paramètres spéculaires du rendu métallique.

export type BadgeTier = 1 | 2 | 3 | 4 | 5;

export function getTier(level: number): BadgeTier {
  if (level <= 3) return 1;
  if (level <= 6) return 2;
  if (level <= 9) return 3;
  if (level <= 12) return 4;
  return 5;
}

export function getStarCount(level: number): number {
  if (level <= 3) return 0;
  if (level <= 5) return 1;
  if (level <= 7) return 2;
  if (level <= 10) return 3;
  if (level <= 12) return 4;
  return 5;
}

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
export function toRoman(n: number): string {
  return ROMAN[n - 1] ?? String(n);
}

export function lighten(hex: string, f: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `#${[
    Math.min(255, Math.round(r + (255 - r) * f)),
    Math.min(255, Math.round(g + (255 - g) * f)),
    Math.min(255, Math.round(b + (255 - b) * f)),
  ].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

export function darken(hex: string, f: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `#${[
    Math.round(r * (1 - f)),
    Math.round(g * (1 - f)),
    Math.round(b * (1 - f)),
  ].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// Type métallique déduit des ids de couleur — pilote les paramètres spéculaires.
export type MetallicType = 'gold' | 'silver' | 'bronze' | 'iron' | null;

export function getMetallicType(primaryId: string, accentId: string | null): MetallicType {
  const ids = [primaryId, accentId].filter(Boolean).join(' ');
  if (/col-gold|col-bronze|acc-gold|acc-brass|acc-copper|acc-iridescent/.test(ids)) return 'gold';
  if (/col-silver|col-chrome|acc-silver|acc-platinum|acc-ivory/.test(ids)) return 'silver';
  if (/col-iron/.test(ids)) return 'iron';
  if (/col-prestige|col-void/.test(ids)) return 'iron';
  return null;
}

export function specularExponent(mt: MetallicType, tier: BadgeTier): number {
  if (mt === 'silver') return 80;
  if (mt === 'gold')   return 48;
  if (mt === 'bronze') return 36;
  if (mt === 'iron')   return 22;
  return tier >= 4 ? 28 : 18;
}

// Accent par défaut selon le tier (quand aucun accent n'est sélectionné).
export const TIER_DEFAULT_ACCENT: Record<BadgeTier, string> = {
  1: '#9AAA88',
  2: '#8899AA',
  3: '#C9A227',
  4: '#C9A227',
  5: '#D4AF37',
};
