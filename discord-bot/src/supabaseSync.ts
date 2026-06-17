import { callSite } from './net.js';
import { endpoints, config } from './config.js';
import type { ClanRosterMember, ClanMovement, GuildClanConfig, TrackedClanEntry } from './clan/types.js';

export interface VoiceEventPayload {
  discord_user_id: string;
  guild_id: string;
  channel_id: string | null;
  channel_name: string | null;
  event: 'join' | 'leave' | 'move';
  occurred_at: string;
}

export async function sendVoiceEvent(payload: VoiceEventPayload): Promise<void> {
  await callSite(endpoints.voiceEvent, { body: payload });
}

export async function triggerMemberSync(guildId: string | null): Promise<unknown> {
  const url = new URL(endpoints.memberSync);
  if (guildId) url.searchParams.set('guild_id', guildId);
  return callSite(url.toString(), { timeoutMs: 60_000 });
}

export interface ClanSyncResult {
  bootstrap: boolean;
  joins: ClanMovement[];
  leaves: ClanMovement[];
}

interface RawClanMovement {
  account_id: number;
  account_name: string;
  role: string | null;
}

interface RawClanSyncResult {
  bootstrap: boolean;
  joins: RawClanMovement[];
  leaves: RawClanMovement[];
}

export async function syncClanRoster(payload: {
  guild_id: string;
  clan_id: number;
  clan_tag: string | null;
  members: ClanRosterMember[];
}): Promise<ClanSyncResult | null> {
  const raw = await callSite<RawClanSyncResult>(endpoints.clanSync, { body: payload });
  if (!raw) return null;
  return {
    bootstrap: raw.bootstrap,
    joins: raw.joins.map((m) => ({ ...m, event: 'join' as const })),
    leaves: raw.leaves.map((m) => ({ ...m, event: 'leave' as const })),
  };
}

interface RawGuildConfig {
  guild_id: string;
  clan_notify_channel_id: string | null;
  tracked_clans: TrackedClanEntry[] | null;
  scan_interval_minutes: number | null;
  notify_leaves_only: boolean | null;
}

function normalizeConfig(guildId: string, raw: RawGuildConfig | null): GuildClanConfig {
  return {
    guild_id: guildId,
    clan_notify_channel_id: raw?.clan_notify_channel_id ?? null,
    tracked_clans: raw?.tracked_clans ?? [],
    scan_interval_minutes: raw?.scan_interval_minutes ?? config.clanTracker.defaultScanIntervalMinutes,
    notify_leaves_only: raw?.notify_leaves_only ?? false,
  };
}

export async function getGuildClanConfig(guildId: string): Promise<GuildClanConfig> {
  const url = new URL(endpoints.clanConfig);
  url.searchParams.set('guild_id', guildId);
  const res = await callSite<{ config: RawGuildConfig | null }>(url.toString(), { method: 'GET' });
  return normalizeConfig(guildId, res?.config ?? null);
}

export async function addTrackedClan(
  guildId: string,
  clanId: number,
  clanTag: string | null,
  clanName: string | null,
  updatedBy: string | null,
): Promise<GuildClanConfig | null> {
  const res = await callSite<{ config: RawGuildConfig }>(endpoints.clanConfig, {
    body: {
      guild_id: guildId,
      action: 'add_clan',
      clan_id: clanId,
      clan_tag: clanTag,
      clan_name: clanName,
      updated_by: updatedBy,
    },
  });
  return res ? normalizeConfig(guildId, res.config) : null;
}

export async function removeTrackedClan(
  guildId: string,
  clanId: number,
  updatedBy: string | null,
): Promise<GuildClanConfig | null> {
  const res = await callSite<{ config: RawGuildConfig }>(endpoints.clanConfig, {
    body: { guild_id: guildId, action: 'remove_clan', clan_id: clanId, updated_by: updatedBy },
  });
  return res ? normalizeConfig(guildId, res.config) : null;
}

export async function setNotifyChannel(
  guildId: string,
  channelId: string | null,
  updatedBy: string | null,
): Promise<GuildClanConfig | null> {
  const res = await callSite<{ config: RawGuildConfig }>(endpoints.clanConfig, {
    body: { guild_id: guildId, action: 'set_channel', channel_id: channelId, updated_by: updatedBy },
  });
  return res ? normalizeConfig(guildId, res.config) : null;
}

export async function setScanInterval(
  guildId: string,
  minutes: number,
  updatedBy: string | null,
): Promise<GuildClanConfig | null> {
  const res = await callSite<{ config: RawGuildConfig }>(endpoints.clanConfig, {
    body: { guild_id: guildId, action: 'set_interval', scan_interval_minutes: minutes, updated_by: updatedBy },
  });
  return res ? normalizeConfig(guildId, res.config) : null;
}

export async function setNotifyLeavesOnly(
  guildId: string,
  enabled: boolean,
  updatedBy: string | null,
): Promise<GuildClanConfig | null> {
  const res = await callSite<{ config: RawGuildConfig }>(endpoints.clanConfig, {
    body: { guild_id: guildId, action: 'set_notify_leaves_only', notify_leaves_only: enabled, updated_by: updatedBy },
  });
  return res ? normalizeConfig(guildId, res.config) : null;
}

export interface ClanMovementRecord {
  id: string;
  guild_id: string;
  clan_id: number;
  clan_tag: string | null;
  account_id: number;
  account_name: string;
  role: string | null;
  event: 'join' | 'leave';
  occurred_at: string;
}

export async function getRecentMovements(
  guildId: string,
  limit = 10,
  clanId?: number,
): Promise<ClanMovementRecord[]> {
  const url = new URL(endpoints.clanMovements);
  url.searchParams.set('guild_id', guildId);
  url.searchParams.set('limit', String(limit));
  if (clanId !== undefined) url.searchParams.set('clan_id', String(clanId));
  const res = await callSite<{ movements: ClanMovementRecord[] }>(url.toString(), { method: 'GET' });
  return res?.movements ?? [];
}
