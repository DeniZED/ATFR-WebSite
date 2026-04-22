import { env } from '@/lib/env';

const BASE = 'https://api.worldoftanks.eu/wot';
const APP_ID = env.wotApplicationId;

interface WotResponse<T> {
  status: 'ok' | 'error';
  error?: { code: number; message: string };
  data: T;
}

async function wotFetch<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const search = new URLSearchParams({
    application_id: APP_ID,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const res = await fetch(`${BASE}${path}?${search}`);
  if (!res.ok) {
    throw new Error(`WoT API ${path}: ${res.status}`);
  }
  const json = (await res.json()) as WotResponse<T>;
  if (json.status !== 'ok' || !json.data) {
    throw new Error(json.error?.message ?? 'WoT API error');
  }
  return json.data;
}

export interface WotPlayer {
  account_id: number;
  nickname: string;
}

export async function searchPlayer(nickname: string): Promise<WotPlayer | null> {
  const data = await wotFetch<WotPlayer[]>('/account/list/', {
    search: nickname,
    limit: 5,
  });
  return data[0] ?? null;
}

export interface WotPlayerStats {
  account_id: number;
  nickname: string;
  battles: number;
  wins: number;
  win_rate: number;
  global_rating: number;
  last_battle_at: number | null;
  created_at: number | null;
}

export async function getPlayerStats(accountId: number): Promise<WotPlayerStats | null> {
  const data = await wotFetch<Record<string, {
    nickname: string;
    global_rating: number;
    last_battle_time: number;
    created_at: number;
    statistics: { all: { battles: number; wins: number } };
  }>>('/account/info/', {
    account_id: accountId,
    fields:
      'nickname,global_rating,last_battle_time,created_at,statistics.all.battles,statistics.all.wins',
  });

  const info = data[String(accountId)];
  if (!info) return null;

  const battles = info.statistics?.all?.battles ?? 0;
  const wins = info.statistics?.all?.wins ?? 0;

  return {
    account_id: accountId,
    nickname: info.nickname,
    battles,
    wins,
    win_rate: battles > 0 ? (wins / battles) * 100 : 0,
    global_rating: info.global_rating ?? 0,
    last_battle_at: info.last_battle_time ? info.last_battle_time * 1000 : null,
    created_at: info.created_at ? info.created_at * 1000 : null,
  };
}

export interface ClanInfo {
  clan_id: number;
  tag: string;
  name: string;
  motto: string;
  members_count: number;
  created_at: number;
  emblems: { x195: { portal: string } };
  members: Array<{
    account_id: number;
    account_name: string;
    role: string;
    role_i18n: string;
    joined_at: number;
  }>;
}

export async function getClanInfo(clanId: string): Promise<ClanInfo | null> {
  const data = await wotFetch<Record<string, ClanInfo>>('/clans/info/', {
    clan_id: clanId,
    fields:
      'clan_id,tag,name,motto,members_count,created_at,emblems,members.account_id,members.account_name,members.role,members.role_i18n,members.joined_at',
  });
  return data[clanId] ?? null;
}

export async function getPlayerClan(accountId: number): Promise<{
  clan_id: number;
  tag: string;
} | null> {
  const data = await wotFetch<Record<string, { clan_id: number | null; clan: { tag: string } | null }>>(
    '/clans/accountinfo/',
    {
      account_id: accountId,
      fields: 'clan_id,clan.tag',
    },
  );
  const info = data[String(accountId)];
  if (!info?.clan_id || !info.clan) return null;
  return { clan_id: info.clan_id, tag: info.clan.tag };
}
