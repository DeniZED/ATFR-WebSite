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

const TYPE_EMOJIS: Record<string, string> = {
  lightTank: '🏎️',
  mediumTank: '⚙️',
  heavyTank: '🛡️',
  'AT-SPG': '🎯',
  SPG: '💥',
};

// Couleur d'embed par classe de char (premium géré séparément côté commande).
const TYPE_COLORS: Record<string, number> = {
  lightTank: 0x9acd32,
  mediumTank: 0x4aa3df,
  heavyTank: 0xc0504d,
  'AT-SPG': 0x8064a2,
  SPG: 0xe08a3c,
};

export function typeEmoji(type: string): string {
  return TYPE_EMOJIS[type] ?? '🚜';
}

export function typeColor(type: string): number {
  return TYPE_COLORS[type] ?? 0x8899a6;
}
