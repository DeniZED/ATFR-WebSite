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
