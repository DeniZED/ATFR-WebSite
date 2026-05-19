import type { LeaderboardEntry } from '@/features/leaderboard/queries';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UnlockType = 'skin' | 'accessory' | 'effect' | 'title';

export interface Unlock {
  id: string;
  type: UnlockType;
  levelRequired: number;
  label: string;
  description: string;
}

export interface AvatarConfig {
  skinId: string;
  tankId?: string;
  accessoryIds: string[];
  effectId: string | null;
  titleId: string | null;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinId: 'default',
  tankId: undefined,
  accessoryIds: [],
  effectId: null,
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
  { level: 1,  title: 'Soldat',             xpRequired: 0 },
  { level: 2,  title: 'Éclaireur',          xpRequired: 300 },
  { level: 3,  title: 'Caporal',            xpRequired: 750 },
  { level: 4,  title: 'Sergent',            xpRequired: 1500 },
  { level: 5,  title: 'Sous-lieutenant',    xpRequired: 3000 },
  { level: 6,  title: 'Lieutenant',         xpRequired: 5500 },
  { level: 7,  title: 'Capitaine',          xpRequired: 9000 },
  { level: 8,  title: 'Commandant',         xpRequired: 14000 },
  { level: 9,  title: 'Colonel',            xpRequired: 21000 },
  { level: 10, title: 'Général de brigade', xpRequired: 30000 },
  { level: 11, title: 'Général de division',xpRequired: 42000 },
  { level: 12, title: 'Maréchal',           xpRequired: 57000 },
  { level: 13, title: 'As des maps',        xpRequired: 75000 },
  { level: 14, title: 'Cartographe ATFR',   xpRequired: 97000 },
  { level: 15, title: 'Légende ATFR',       xpRequired: 125000 },
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
  // Base XP: 5 to 100 based on performance ratio
  const base = Math.max(5, Math.round(ratio * 100));

  const gameMode = getMetaString(entry.meta, 'game_mode');
  const mapAccuracy = getMetaNumber(entry.meta, 'map_accuracy_pct') ?? 0;
  const bestStreak = getMetaNumber(entry.meta, 'best_streak') ?? 0;

  // Mode difficulty bonus
  const modeBonus =
    gameMode === 'blind' ? 25 :
    gameMode === 'sprint' ? 10 : 0;

  // Map accuracy bonus (up to 25 extra XP)
  const accuracyBonus = Math.round(Math.max(0, mapAccuracy - 50) / 2);

  // Streak bonus (2 XP per consecutive correct map, capped at 20)
  const streakBonus = Math.min(20, bestStreak * 2);

  return base + modeBonus + accuracyBonus + streakBonus;
}

export function totalXpFromScores(scores: LeaderboardEntry[]): number {
  return scores.reduce((sum, s) => sum + calculateGameXp(s), 0);
}

// ─── Unlocks catalog ─────────────────────────────────────────────────────────

export const UNLOCKS: Unlock[] = [
  // Skins
  { id: 'skin-default',  type: 'skin', levelRequired: 1,  label: 'Kaki standard',       description: 'Peinture réglementaire de base.' },
  { id: 'skin-desert',   type: 'skin', levelRequired: 2,  label: 'Désert',               description: 'Ton sable et ocre pour terrain aride.' },
  { id: 'skin-winter',   type: 'skin', levelRequired: 3,  label: 'Hiver',                description: 'Gris-blanc pour opérations en terrain enneigé.' },
  { id: 'skin-urban',    type: 'skin', levelRequired: 5,  label: 'Urbain',               description: 'Camo gris mélangé pour la ville.' },
  { id: 'skin-forest',   type: 'skin', levelRequired: 7,  label: 'Forêt profonde',       description: 'Vert sombre pour les zones boisées.' },
  { id: 'skin-digital',  type: 'skin', levelRequired: 9,  label: 'Digital',              description: 'Motif pixelisé tactique.' },
  { id: 'skin-arctic',   type: 'skin', levelRequired: 11, label: 'Arctique',             description: 'Bleu glacier pour les missions polaires.' },
  { id: 'skin-atfr',     type: 'skin', levelRequired: 13, label: 'ATFR Elite',           description: 'Livrée officielle de l\'escadron ATFR.' },
  { id: 'skin-chrome',   type: 'skin', levelRequired: 14, label: 'Chrome',               description: 'Finition métal brossé pour les vrais.' },
  { id: 'skin-prestige', type: 'skin', levelRequired: 15, label: 'Prestige Noir',        description: 'Noir absolu réservé aux légendes.' },

  // Accessories
  { id: 'acc-antenna',   type: 'accessory', levelRequired: 2,  label: 'Antenne longue',  description: 'Antenne radio de terrain allongée.' },
  { id: 'acc-star1',     type: 'accessory', levelRequired: 3,  label: '1 étoile de kill',description: 'Marque une victoire de map.' },
  { id: 'acc-mudguards', type: 'accessory', levelRequired: 4,  label: 'Boue de combat',  description: 'Traces de terrain sur les chenilles.' },
  { id: 'acc-flag',      type: 'accessory', levelRequired: 6,  label: 'Fanion ATFR',     description: 'Petit fanion de clan sur la tourelle.' },
  { id: 'acc-star3',     type: 'accessory', levelRequired: 8,  label: '3 étoiles de kill',description: 'Triple kill sur les maps.' },
  { id: 'acc-hatch',     type: 'accessory', levelRequired: 10, label: 'Commandant dehors',description: 'Commandant en position de combat.' },
  { id: 'acc-ace',       type: 'accessory', levelRequired: 12, label: 'Médaille As',      description: 'Médaille d\'As de la carte dorée.' },

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

  // Effects
  { id: 'fx-worn',       type: 'effect', levelRequired: 7,  label: 'Combat usé',         description: 'Rayures et marques de bataille.' },
  { id: 'fx-glow-gold',  type: 'effect', levelRequired: 10, label: 'Halo doré',          description: 'Aura or autour du char.' },
  { id: 'fx-prestige',   type: 'effect', levelRequired: 15, label: 'Aura Prestige',      description: 'Halo irisé pour les légendes.' },
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
