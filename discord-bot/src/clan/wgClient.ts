import { config } from '../config.js';
import type { ClanRoster } from './types.js';

interface WgClanMember {
  account_id: number;
  account_name: string;
  role: string;
}

interface WgClanInfo {
  clan_id: number;
  tag: string;
  name: string;
  members: WgClanMember[];
}

interface WgEnvelope<T> {
  status: string;
  error?: { message: string; field?: string };
  data: T;
}

async function wg<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!config.clanTracker.wotApplicationId) {
    throw new Error('WOT_APPLICATION_ID is required for clan tracking');
  }
  const qs = new URLSearchParams({ application_id: config.clanTracker.wotApplicationId, ...params });
  const res = await fetch(`${config.clanTracker.wgApiBase}${path}?${qs}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`WG ${path} → ${res.status}`);
  const body = (await res.json()) as WgEnvelope<T>;
  if (body.status !== 'ok') {
    const field = body.error?.field ? ` (field=${body.error.field})` : '';
    throw new Error(`WG error ${path}: ${body.error?.message ?? 'unknown'}${field}`);
  }
  return body.data;
}

export interface ResolvedClan {
  clanId: number;
  tag: string | null;
  name: string | null;
}

/** Résout un tag de clan WoT vers son clan_id via l'API WG (recherche + correspondance exacte). */
export async function searchClanByTag(tag: string): Promise<ResolvedClan | null> {
  const cleaned = tag.trim();
  if (cleaned.length < 2) return null;
  const results = await wg<Array<{ clan_id: number; tag: string; name: string }> | null>('/clans/list/', {
    search: cleaned,
    limit: '20',
    fields: 'clan_id,tag,name',
  });
  if (!results) return null;
  const exact = results.find((c) => c.tag.toLowerCase() === cleaned.toLowerCase());
  if (!exact) return null;
  return { clanId: exact.clan_id, tag: exact.tag, name: exact.name };
}

export interface ResolvedAccount {
  accountId: number;
  nickname: string;
}

/**
 * Résout un pseudo de joueur WoT vers son account_id via l'API WG.
 * Essaie une correspondance exacte, puis le premier résultat "commence par".
 */
export async function resolveAccount(nickname: string): Promise<ResolvedAccount | null> {
  const search = nickname.trim();
  if (search.length < 2) return null;
  const results = await wg<Array<{ account_id: number; nickname: string }> | null>('/account/list/', {
    search,
    limit: '10',
    fields: 'account_id,nickname',
  });
  if (!results || results.length === 0) return null;
  const exact = results.find((a) => a.nickname.toLowerCase() === search.toLowerCase());
  const chosen = exact ?? results[0];
  return { accountId: chosen.account_id, nickname: chosen.nickname };
}

/** Tag du clan actuel d'un joueur (best-effort ; null si aucun ou en cas d'échec). */
export async function fetchPlayerClanTag(accountId: number): Promise<string | null> {
  try {
    const data = await wg<Record<string, { clan?: { tag: string } | null } | null>>(
      '/clans/accountinfo/',
      { account_id: String(accountId), fields: 'clan.tag' },
    );
    return data?.[String(accountId)]?.clan?.tag ?? null;
  } catch {
    return null;
  }
}

/** Accepte un clan_id numérique ou un tag, et retourne le clan résolu. */
export async function resolveClanInput(input: string): Promise<ResolvedClan | null> {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    const roster = await fetchClanRoster(Number(trimmed));
    return roster ? { clanId: roster.clanId, tag: roster.tag, name: roster.name } : null;
  }
  return searchClanByTag(trimmed);
}

export interface ClanInfo {
  clanId: number;
  tag: string | null;
  name: string | null;
  membersCount: number;
  motto: string | null;
  description: string | null;
  createdAt: number | null;
  leaderName: string | null;
  color: string | null;
  emblemUrl: string | null;
  members: Array<{ name: string; role: string | null; roleLabel: string | null }>;
}

interface WgClanInfoDetailed {
  clan_id: number;
  tag?: string;
  name?: string;
  members_count?: number;
  motto?: string;
  description?: string;
  created_at?: number;
  leader_name?: string;
  color?: string;
  emblems?: { x256?: { wot?: string; portal?: string } } | null;
  members?: Array<{
    account_name?: string;
    role?: string;
    role_i18n?: string;
  } | null> | null;
}

/** Fiche détaillée d'un clan (effectif, chef, emblème, état-major) via l'API WG. */
export async function fetchClanInfo(clanId: number): Promise<ClanInfo | null> {
  const data = await wg<Record<string, WgClanInfoDetailed | null>>('/clans/info/', {
    clan_id: String(clanId),
    fields:
      'clan_id,tag,name,members_count,motto,description,created_at,leader_name,color,' +
      'emblems.x256.wot,emblems.x256.portal,' +
      'members.account_name,members.role,members.role_i18n',
    language: 'fr',
  });
  const clan = data?.[String(clanId)];
  if (!clan) return null;

  const members = (clan.members ?? [])
    .filter((m): m is NonNullable<typeof m> => !!m && typeof m.account_name === 'string')
    .map((m) => ({
      name: m.account_name as string,
      role: m.role ?? null,
      roleLabel: m.role_i18n ?? null,
    }));

  return {
    clanId: clan.clan_id,
    tag: clan.tag ?? null,
    name: clan.name ?? null,
    membersCount: clan.members_count ?? members.length,
    motto: clan.motto?.trim() || null,
    description: clan.description?.trim() || null,
    createdAt: clan.created_at ?? null,
    leaderName: clan.leader_name ?? null,
    color: clan.color ?? null,
    emblemUrl: clan.emblems?.x256?.wot ?? clan.emblems?.x256?.portal ?? null,
    members,
  };
}

export async function fetchClanRoster(clanId: number): Promise<ClanRoster | null> {
  const clanMap = await wg<Record<string, WgClanInfo | null>>('/clans/info/', {
    clan_id: String(clanId),
    fields: 'clan_id,tag,name,members.account_id,members.account_name,members.role',
  });
  const clan = clanMap?.[String(clanId)];
  if (!clan) return null;

  const members = (clan.members ?? []).filter(
    (m): m is WgClanMember =>
      !!m && typeof m.account_id === 'number' && Number.isFinite(m.account_id) && m.account_id > 0,
  );

  return {
    clanId: clan.clan_id,
    tag: clan.tag ?? null,
    name: clan.name ?? null,
    members: members.map((m) => ({
      account_id: m.account_id,
      account_name: m.account_name,
      role: m.role ?? null,
    })),
  };
}
