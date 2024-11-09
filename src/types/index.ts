// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Clan Types
export interface ClanMember {
  account_id: number;
  account_name: string;
  joined_at: number;
  role: string;
  role_i18n: string;
  last_battle_time: number;
  discord_id?: string;
}

export interface ClanStats {
  members_count: number;
  battles_count_avg_daily: number;
  wins_ratio_avg: number;
  global_rating_avg: number;
}

export interface ClanActivity {
  date: string;
  battles: number;
  wins: number;
}

// Player Types
export interface PlayerStats {
  account_id: number;
  name: string;
  role: string;
  rating: number;
  winrate: number;
}

export interface PlayerInfo {
  discordId?: string;
  stats: PlayerStats[];
}

// Event Types
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  description: string;
  isPublic: boolean;
  backgroundImage?: string;
}

// Application Types
export interface Application {
  id: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
  playerName: string;
  discordTag: string;
  wn8: string;
  winRate: string;
  battles: string;
  tier10Count: string;
  availability: string;
  motivation: string;
  previousClans: string;
  targetClan: string;
}

// Dashboard Types
export interface DashboardStats {
  members_count: number;
  battles_avg: number;
  efficiency: number;
  global_rating: number;
  daily_battles: { date: string; count: number }[];
}

export interface SortConfig {
  key: 'account_name' | 'role_i18n' | 'discord_id';
  direction: 'asc' | 'desc';
}

// Member Activity Types
export type ActivityType = 'join' | 'leave';

export interface ClanActivityLog {
  account_id: number;
  account_name: string;
  type: ActivityType;
  timestamp: number;
  role: string;
  role_i18n: string;
  reason?: string;
}