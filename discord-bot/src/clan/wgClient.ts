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
