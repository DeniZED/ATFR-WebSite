export interface ClanRosterMember {
  account_id: number;
  account_name: string;
  role: string | null;
}

export interface ClanRoster {
  clanId: number;
  tag: string | null;
  name: string | null;
  members: ClanRosterMember[];
}

export type MovementEvent = 'join' | 'leave';

export interface ClanMovement {
  account_id: number;
  account_name: string;
  role: string | null;
  event: MovementEvent;
}

export interface TrackedClanEntry {
  clan_id: number;
  clan_tag: string | null;
  clan_name: string | null;
}

export interface GuildClanConfig {
  guild_id: string;
  clan_notify_channel_id: string | null;
  tracked_clans: TrackedClanEntry[];
  scan_interval_minutes: number;
  notify_leaves_only: boolean;
}

// Copie miroir du contrat de `/.netlify/functions/player-stats`, dont la
// source de vérité est `src/types/playerStats.ts` à la racine du repo (P3-4).
// Le tsconfig du bot (`rootDir: "src"`) ne peut pas importer hors de son
// arbre : toute évolution du contrat doit être répercutée ici à la main.
export interface PlayerRecentStats {
  battles: number | null;
  winRate: number | null;
  wn8: number | null;
  wnx: number | null;
  avgTier: number | null;
}

export interface PlayerStats {
  accountId: number;
  nickname: string;
  winRate: number | null;
  battles: number;
  damagePerBattle: number | null;
  wn8: number | null;
  wnx: number | null;
  avgTier: number | null;
  tier10Count: number;
  globalRating: number;
  lastBattleTime: number;
  recent: PlayerRecentStats | null;
  recruitmentScore: number | null;
  recruitmentThresholds: { minWn8: number; minBattles: number };
}
