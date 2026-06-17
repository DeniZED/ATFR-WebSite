import {
  getGuildClanConfig,
  addTrackedClan as addTrackedClanRemote,
  removeTrackedClan as removeTrackedClanRemote,
  setNotifyChannel as setNotifyChannelRemote,
  setScanInterval as setScanIntervalRemote,
} from './supabaseSync.js';
import type { GuildClanConfig } from './clan/types.js';

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { config: GuildClanConfig; fetchedAt: number }>();

export async function getGuildConfig(guildId: string): Promise<GuildClanConfig> {
  const cached = cache.get(guildId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.config;
  return refreshGuildConfig(guildId);
}

export async function refreshGuildConfig(guildId: string): Promise<GuildClanConfig> {
  const fresh = await getGuildClanConfig(guildId);
  cache.set(guildId, { config: fresh, fetchedAt: Date.now() });
  return fresh;
}

export async function addTrackedClan(
  guildId: string,
  clanId: number,
  clanTag: string | null,
  clanName: string | null,
  updatedBy: string | null,
): Promise<GuildClanConfig | null> {
  const result = await addTrackedClanRemote(guildId, clanId, clanTag, clanName, updatedBy);
  if (result) cache.set(guildId, { config: result, fetchedAt: Date.now() });
  return result;
}

export async function removeTrackedClan(
  guildId: string,
  clanId: number,
  updatedBy: string | null,
): Promise<GuildClanConfig | null> {
  const result = await removeTrackedClanRemote(guildId, clanId, updatedBy);
  if (result) cache.set(guildId, { config: result, fetchedAt: Date.now() });
  return result;
}

export async function setNotifyChannel(
  guildId: string,
  channelId: string | null,
  updatedBy: string | null,
): Promise<GuildClanConfig | null> {
  const result = await setNotifyChannelRemote(guildId, channelId, updatedBy);
  if (result) cache.set(guildId, { config: result, fetchedAt: Date.now() });
  return result;
}

export async function setScanInterval(
  guildId: string,
  minutes: number,
  updatedBy: string | null,
): Promise<GuildClanConfig | null> {
  const result = await setScanIntervalRemote(guildId, minutes, updatedBy);
  if (result) cache.set(guildId, { config: result, fetchedAt: Date.now() });
  return result;
}
