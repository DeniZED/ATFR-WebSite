export interface ClanMember {
  account_id: number;
  account_name: string;
  joined_at: number;
  role: string;
  role_i18n: string;
  last_battle_time: number;
  discord_id?: string;
}

export interface PlayerStats {
  wn8: number;
  battles: number;
  winRate: string;
  avgTier: string;
  lastUpdate: number;
}

export interface MemberStats {
  [accountId: number]: PlayerStats;
}

export interface SortConfig {
  key: 'account_name' | 'role_i18n' | 'discord_id';
  direction: 'asc' | 'desc';
}