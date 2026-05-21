import type { LeaderboardEntry } from '@/features/leaderboard/queries';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UnlockType = 'title' | 'emblem';

export interface Unlock {
  id: string;
  type: UnlockType;
  levelRequired: number;
  label: string;
  description: string;
}

export interface AvatarConfig {
  primaryColorId: string;
  accentColorId: string | null;
  numeralColorId: string | null;
  emblemId: string | null;
  emblemColorId: string | null;
  patternId: string | null;
  borderStyleId: string;
  titleId: string | null;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  primaryColorId: 'col-olive',
  accentColorId: null,
  numeralColorId: null,
  emblemId: null,
  emblemColorId: null,
  patternId: null,
  borderStyleId: 'standard',
  titleId: null,
};

// ─── Tank catalog ─────────────────────────────────────────────────────────────

export interface TankDef {
  id: string;
  label: string;
  description: string;
  levelRequired: number;
}

export const TANK_CATALOG: TankDef[] = [
  { id: 'tank-default', label: 'Char standard',  description: 'Le char réglementaire de l\'académie.', levelRequired: 1 },
];

export interface LevelDef {
  level: number;
  title: string;
  xpRequired: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  xpInLevel: number;
  xpToNext: number;
  progress: number; // 0-1
  isMax: boolean;
}

// ─── Level table ─────────────────────────────────────────────────────────────

export const LEVEL_TABLE: LevelDef[] = [
  { level: 1,  title: 'Soldat',              xpRequired: 0 },
  { level: 2,  title: 'Éclaireur',           xpRequired: 200 },
  { level: 3,  title: 'Caporal',             xpRequired: 500 },
  { level: 4,  title: 'Sergent',             xpRequired: 1_000 },
  { level: 5,  title: 'Sous-lieutenant',     xpRequired: 1_800 },
  { level: 6,  title: 'Lieutenant',          xpRequired: 3_000 },
  { level: 7,  title: 'Capitaine',           xpRequired: 5_000 },
  { level: 8,  title: 'Commandant',          xpRequired: 8_000 },
  { level: 9,  title: 'Colonel',             xpRequired: 12_500 },
  { level: 10, title: 'Général de brigade',  xpRequired: 18_000 },
  { level: 11, title: 'Général de division', xpRequired: 26_000 },
  { level: 12, title: 'Maréchal',            xpRequired: 36_000 },
  { level: 13, title: 'As des maps',         xpRequired: 48_000 },
  { level: 14, title: 'Cartographe ATFR',    xpRequired: 62_000 },
  { level: 15, title: 'Légende ATFR',        xpRequired: 75_000 },
];

const MAX_LEVEL = LEVEL_TABLE[LEVEL_TABLE.length - 1];

export function levelFromXp(totalXp: number): LevelInfo {
  let current = LEVEL_TABLE[0];
  for (const def of LEVEL_TABLE) {
    if (totalXp >= def.xpRequired) current = def;
    else break;
  }
  const nextDef = LEVEL_TABLE[current.level]; // level is 1-indexed, index = level-1
  const isMax = current.level === MAX_LEVEL.level;
  const xpBase = current.xpRequired;
  const xpCap = nextDef?.xpRequired ?? current.xpRequired;
  const xpInLevel = totalXp - xpBase;
  const xpToNext = isMax ? 0 : xpCap - totalXp;
  const range = xpCap - xpBase;
  const progress = isMax ? 1 : range > 0 ? Math.min(1, xpInLevel / range) : 1;
  return {
    level: current.level,
    title: current.title,
    xp: totalXp,
    xpInLevel,
    xpToNext,
    progress,
    isMax,
  };
}

// ─── Colour catalogue ─────────────────────────────────────────────────────────

export interface ColorDef {
  id: string;
  label: string;
  hex: string;
  levelRequired: number;
  metallic?: boolean;
}

export const PRIMARY_COLORS: ColorDef[] = [
  { id: 'col-olive',    label: 'Kaki olive',     hex: '#4E7828', levelRequired: 1 },
  { id: 'col-forest',   label: 'Vert forêt',     hex: '#2D5016', levelRequired: 1 },
  { id: 'col-desert',   label: 'Sable désert',   hex: '#B08828', levelRequired: 1 },
  { id: 'col-savanna',  label: 'Brun savane',    hex: '#7A5B28', levelRequired: 1 },
  { id: 'col-steel',    label: 'Gris acier',     hex: '#586068', levelRequired: 1 },
  { id: 'col-storm',    label: 'Bleu orage',     hex: '#2A3A5A', levelRequired: 1 },
  { id: 'col-teal',     label: 'Sarcelle',       hex: '#1A5A5A', levelRequired: 1 },
  { id: 'col-navy',     label: 'Marine',         hex: '#1A2A3A', levelRequired: 1 },
  { id: 'col-burgundy', label: 'Bordeaux',       hex: '#6A1A1A', levelRequired: 1 },
  { id: 'col-purple',   label: 'Violet nuit',    hex: '#3A1A5A', levelRequired: 1 },
  { id: 'col-charcoal', label: 'Anthracite',     hex: '#282828', levelRequired: 1 },
  { id: 'col-iron',     label: 'Blanc fer',      hex: '#C8C8D0', levelRequired: 1 },
  { id: 'col-copper',   label: 'Cuivre brun',    hex: '#8A4A1A', levelRequired: 1 },
  { id: 'col-jungle',   label: 'Vert jungle',    hex: '#1A4A1A', levelRequired: 1 },
  { id: 'col-slate',    label: 'Ardoise bleue',  hex: '#2A2A6A', levelRequired: 1 },
  { id: 'col-rust',     label: 'Rouille',        hex: '#7A3018', levelRequired: 1 },
  { id: 'col-bronze',   label: 'Bronze patiné',  hex: '#7A5018', levelRequired: 5,  metallic: true },
  { id: 'col-silver',   label: 'Argent poli',    hex: '#8A9AB0', levelRequired: 8,  metallic: true },
  { id: 'col-gold',     label: 'Or antique',     hex: '#B89018', levelRequired: 10, metallic: true },
  { id: 'col-crimson',  label: 'Cramoisi royal', hex: '#8A0A0A', levelRequired: 12 },
  { id: 'col-atfr',     label: 'Marine ATFR',    hex: '#0A1828', levelRequired: 13 },
  { id: 'col-chrome',   label: 'Chrome pur',     hex: '#9AAABB', levelRequired: 14, metallic: true },
  { id: 'col-prestige', label: 'Noir prestige',  hex: '#080808', levelRequired: 15 },
];

export const ACCENT_COLORS: ColorDef[] = [
  { id: 'acc-brass',     label: 'Laiton',      hex: '#B8860B', levelRequired: 4 },
  { id: 'acc-silver',    label: 'Argent',      hex: '#C0C0C0', levelRequired: 4 },
  { id: 'acc-ivory',     label: 'Ivoire',      hex: '#F0EAD6', levelRequired: 4 },
  { id: 'acc-gold',      label: 'Or',          hex: '#C9A227', levelRequired: 7 },
  { id: 'acc-copper',    label: 'Cuivre',      hex: '#B87333', levelRequired: 7 },
  { id: 'acc-royal',     label: 'Bleu royal',  hex: '#2828AA', levelRequired: 7 },
  { id: 'acc-platinum',  label: 'Platine',     hex: '#E0DFE0', levelRequired: 10 },
  { id: 'acc-blood',     label: 'Rouge sang',  hex: '#8B0000', levelRequired: 10 },
  { id: 'acc-iridescent', label: 'Irisé',      hex: '#C9A227', levelRequired: 14, metallic: true },
];

export function getPrimaryColor(id: string): ColorDef {
  return PRIMARY_COLORS.find(c => c.id === id) ?? PRIMARY_COLORS[0];
}

export function getAccentColor(id: string | null): ColorDef | null {
  if (!id) return null;
  return ACCENT_COLORS.find(c => c.id === id) ?? null;
}

export function resolveColor(id: string | null | undefined): string | null {
  if (!id) return null;
  const p = PRIMARY_COLORS.find(c => c.id === id);
  if (p) return p.hex;
  const a = ACCENT_COLORS.find(c => c.id === id);
  if (a) return a.hex;
  return null;
}

export interface PatternDef {
  id: string;
  label: string;
}
export const PATTERNS: PatternDef[] = [
  { id: 'pat-hatch', label: 'Hachures diagonales' },
  { id: 'pat-grid',  label: 'Quadrillage' },
  { id: 'pat-dots',  label: 'Pointillés' },
];

export interface BorderStyleDef {
  id: string;
  label: string;
}
export const BORDER_STYLES: BorderStyleDef[] = [
  { id: 'none',     label: 'Aucun' },
  { id: 'thin',     label: 'Fin' },
  { id: 'standard', label: 'Standard' },
  { id: 'double',   label: 'Double' },
];

// ─── XP calculation ──────────────────────────────────────────────────────────

function getMetaNumber(meta: unknown, key: string): number | null {
  if (typeof meta !== 'object' || meta === null) return null;
  const v = (meta as Record<string, unknown>)[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function getMetaString(meta: unknown, key: string): string | null {
  if (typeof meta !== 'object' || meta === null) return null;
  const v = (meta as Record<string, unknown>)[key];
  return typeof v === 'string' ? v : null;
}

export function calculateGameXp(entry: LeaderboardEntry): number {
  const ratio = entry.max_score > 0 ? entry.score / entry.max_score : 0;
  const base = Math.max(5, Math.round(ratio * 100));

  const gameMode    = getMetaString(entry.meta, 'game_mode');
  const mapAccuracy = getMetaNumber(entry.meta, 'map_accuracy_pct') ?? 0;
  const bestStreak  = getMetaNumber(entry.meta, 'best_streak') ?? 0;
  const isDaily     = (entry.meta as Record<string,unknown>)?.is_daily_challenge === true;

  const modeBonus     = gameMode === 'blind' ? 25 : gameMode === 'sprint' ? 10 : 0;
  const accuracyBonus = Math.round(Math.max(0, mapAccuracy - 50) / 2);
  const streakBonus   = Math.min(20, bestStreak * 2);
  const perfBonus     = ratio >= 1.0 ? 50 : ratio >= 0.8 ? 15 : 0;
  const dailyBonus    = isDaily ? 30 : 0;

  return base + modeBonus + accuracyBonus + streakBonus + perfBonus + dailyBonus;
}

/** Bonus XP pour les jours joués consécutifs (calculé depuis l'historique). */
export function consecutiveDaysBonus(scores: LeaderboardEntry[]): number {
  const MS_DAY = 86_400_000;
  const todayDay = Math.floor(Date.now() / MS_DAY);

  const playedDays = new Set(
    scores
      .filter((s) => (s as unknown as { played_at?: string }).played_at)
      .map((s) => Math.floor(new Date((s as unknown as { played_at: string }).played_at).getTime() / MS_DAY))
  );

  let streak = 0;
  for (let i = 0; i <= 30; i++) {
    if (playedDays.has(todayDay - i)) streak++;
    else if (i > 0) break;
  }
  return Math.min(streak * 10, 100);
}

export function totalXpFromScores(scores: LeaderboardEntry[]): number {
  const base = scores.reduce((sum, s) => sum + calculateGameXp(s), 0);
  return base + consecutiveDaysBonus(scores);
}

// ─── Unlocks catalog ─────────────────────────────────────────────────────────

export const UNLOCKS: Unlock[] = [
  // Titles
  { id: 'title-rookie',       type: 'title', levelRequired: 1,  label: 'Recrue des maps',    description: '' },
  { id: 'title-scout',        type: 'title', levelRequired: 2,  label: 'Scout cartographe',  description: '' },
  { id: 'title-corporal',     type: 'title', levelRequired: 3,  label: 'Caporal cartographe',description: '' },
  { id: 'title-sergeant',     type: 'title', levelRequired: 5,  label: 'Sergent géographe',  description: '' },
  { id: 'title-lieutenant',   type: 'title', levelRequired: 7,  label: 'Lieutenant tactique',description: '' },
  { id: 'title-captain',      type: 'title', levelRequired: 9,  label: 'Capitaine des maps', description: '' },
  { id: 'title-commander',    type: 'title', levelRequired: 11, label: 'Commandant ATFR',    description: '' },
  { id: 'title-legend',       type: 'title', levelRequired: 13, label: 'Légende des Maps',   description: '' },
  { id: 'title-master',       type: 'title', levelRequired: 15, label: 'Maître Géographe',   description: '' },

  // Emblems
  { id: 'emb-crosshair', type: 'emblem', levelRequired: 2,  label: 'Réticule',      description: 'Viseur de précision.' },
  { id: 'emb-star',      type: 'emblem', levelRequired: 4,  label: 'Étoile',        description: 'Étoile de mérite.' },
  { id: 'emb-bolt',      type: 'emblem', levelRequired: 6,  label: 'Éclair',        description: 'Frappe rapide.' },
  { id: 'emb-diamond',   type: 'emblem', levelRequired: 9,  label: 'Diamant',       description: 'Diamant de l\'élite.' },
  { id: 'emb-compass',   type: 'emblem', levelRequired: 12, label: 'Boussole',      description: 'Maître géographe.' },
];

export function getUnlockedIds(level: number): Set<string> {
  return new Set(UNLOCKS.filter((u) => u.levelRequired <= level).map((u) => u.id));
}

export function getUnlockById(id: string): Unlock | undefined {
  return UNLOCKS.find((u) => u.id === id);
}

// ─── Level rewards ────────────────────────────────────────────────────────────
// What new items are unlocked upon reaching each level.

export interface LevelReward {
  level: number;
  unlocks: Unlock[];
}

export const LEVEL_REWARDS: LevelReward[] = LEVEL_TABLE
  .map((def) => ({
    level: def.level,
    unlocks: UNLOCKS.filter((u) => u.levelRequired === def.level),
  }))
  .filter((r) => r.unlocks.length > 0);

export function getNextReward(level: number): LevelReward | undefined {
  return LEVEL_REWARDS.find((r) => r.level > level);
}
