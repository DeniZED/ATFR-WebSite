// Libellés partagés (nation, type, tier) utilisés par les commandes /char et
// /compare, pour une source de vérité unique.

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const NATION_LABELS: Record<string, string> = {
  ussr: '🇷🇺 URSS',
  germany: '🇩🇪 Allemagne',
  usa: '🇺🇸 États-Unis',
  france: '🇫🇷 France',
  uk: '🇬🇧 Royaume-Uni',
  china: '🇨🇳 Chine',
  japan: '🇯🇵 Japon',
  czech: '🇨🇿 Tchécoslovaquie',
  sweden: '🇸🇪 Suède',
  poland: '🇵🇱 Pologne',
  italy: '🇮🇹 Italie',
};

const TYPE_LABELS: Record<string, string> = {
  lightTank: '🏎️ Char léger',
  mediumTank: '⚙️ Char moyen',
  heavyTank: '🛡️ Char lourd',
  'AT-SPG': '🎯 Chasseur de chars',
  SPG: '💥 Artillerie',
};

export function nationLabel(nation: string): string {
  return NATION_LABELS[nation] ?? nation;
}

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function tierRoman(tier: number): string {
  return ROMAN[tier] ?? String(tier);
}
