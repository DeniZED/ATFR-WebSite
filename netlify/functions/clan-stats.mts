import type { Context } from '@netlify/functions';

const APP_ID = process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;
const TOMATO_API_KEY = process.env.TOMATO_API_KEY;
const CLAN_ID = process.env.CLAN_ID || process.env.VITE_CLAN_ID;
const WG_BASE = 'https://api.worldoftanks.eu/wot';
const TOMATO_BASE = 'https://api.tomato.gg';

// /account/info/ accepts up to 100 IDs per call.
const ACCOUNT_INFO_CHUNK = 100;
// tomato bulk-stats also accepts comma-separated IDs; stay under 100 per call.
const BULK_CHUNK = 100;

interface ClanMember {
  account_id: number;
  account_name: string;
  role: string;
}

interface ClanInfo {
  clan_id: number;
  members_count: number;
  members: ClanMember[];
  name: string;
  tag: string;
}

interface AccountInfo {
  account_id: number;
  nickname: string;
  last_battle_time: number;
  logout_at: number;
  global_rating: number;
  statistics: {
    random?: {
      battles: number;
      wins: number;
      damage_dealt: number;
      frags: number;
      spotted: number;
    };
    all: {
      battles: number;
      wins: number;
      damage_dealt: number;
      frags: number;
      spotted: number;
    };
  };
}

interface TomatoStatSummary {
  battles: number;
  wn8: number;
  winrate: number;
  avgTier: number;
}

interface TomatoBulkPlayer {
  recent: TomatoStatSummary | null;
  overall: TomatoStatSummary | null;
}

async function wg<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!APP_ID) throw new Error('WOT_APPLICATION_ID missing');
  const qs = new URLSearchParams({ application_id: APP_ID, ...params });
  const res = await fetch(`${WG_BASE}${path}?${qs}`);
  if (!res.ok) throw new Error(`WG ${path} ${res.status}`);
  const json = (await res.json()) as {
    status: string;
    error?: { message: string; field?: string };
    data: T;
  };
  if (json.status !== 'ok') {
    const msg = json.error?.message ?? 'unknown';
    const field = json.error?.field;
    throw new Error(
      `WG error ${path}: ${msg}${field ? ` (field=${field})` : ''}`,
    );
  }
  return json.data;
}

async function fetchAccountsInfo(
  members: ClanMember[],
): Promise<Record<string, AccountInfo>> {
  const out: Record<string, AccountInfo> = {};
  for (let i = 0; i < members.length; i += ACCOUNT_INFO_CHUNK) {
    const chunk = members.slice(i, i + ACCOUNT_INFO_CHUNK);
    const ids = chunk.map((m) => m.account_id).join(',');
    const res = await wg<Record<string, AccountInfo>>('/account/info/', {
      account_id: ids,
      fields:
        'account_id,nickname,last_battle_time,logout_at,global_rating,' +
        'statistics.all.battles,statistics.all.wins,statistics.all.damage_dealt,' +
        'statistics.all.frags,statistics.all.spotted,' +
        'statistics.random.battles,statistics.random.wins,statistics.random.damage_dealt,' +
        'statistics.random.frags,statistics.random.spotted',
    });
    Object.assign(out, res);
  }
  return out;
}

async function fetchTomatoBulkStats(
  ids: number[],
): Promise<Record<string, TomatoBulkPlayer>> {
  if (!TOMATO_API_KEY) throw new Error('TOMATO_API_KEY missing');
  const out: Record<string, TomatoBulkPlayer> = {};
  for (let i = 0; i < ids.length; i += BULK_CHUNK) {
    const chunk = ids.slice(i, i + BULK_CHUNK);
    const res = await fetch(
      `${TOMATO_BASE}/api/player/bulk-stats/eu?ids=${chunk.join(',')}`,
      { headers: { 'x-api-key': TOMATO_API_KEY } },
    );
    if (!res.ok) throw new Error(`Tomato bulk-stats ${res.status}`);
    const json = (await res.json()) as {
      meta: { status: string };
      data: Record<string, TomatoBulkPlayer>;
    };
    Object.assign(out, json.data);
  }
  return out;
}

export interface ClanStatsPayload {
  clanId: number | null;
  name: string | null;
  tag: string | null;
  membersCount: number;
  sampledMembers: number;
  onlineNow: number;
  active24h: number;
  active7d: number;
  avgWinRate: number | null;
  avgWn8: number | null;
  avgGlobalRating: number | null;
  avgDamagePerBattle: number | null;
  avgFragsPerBattle: number | null;
  avgSpotsPerBattle: number | null;
  totalBattles: number;
  maxWn8: number | null;
  maxWn8Nickname: string | null;
  topPlayers: Array<{
    accountId: number;
    nickname: string;
    role: string;
    wn8: number | null;
    winRate: number | null;
    battles: number;
    globalRating: number;
    lastBattleTime: number;
    recentWn8: number | null;
    recentWinRate: number | null;
  }>;
  computedAt: string;
}

const EMPTY_PAYLOAD = (clan: ClanInfo): ClanStatsPayload => ({
  clanId: clan.clan_id,
  name: clan.name,
  tag: clan.tag,
  membersCount: clan.members_count ?? 0,
  sampledMembers: 0,
  onlineNow: 0,
  active24h: 0,
  active7d: 0,
  avgWinRate: null,
  avgWn8: null,
  avgGlobalRating: null,
  avgDamagePerBattle: null,
  avgFragsPerBattle: null,
  avgSpotsPerBattle: null,
  totalBattles: 0,
  maxWn8: null,
  maxWn8Nickname: null,
  topPlayers: [],
  computedAt: new Date().toISOString(),
});

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const url = new URL(req.url);
  const clanIdRaw = url.searchParams.get('clan_id') || CLAN_ID;
  const clanId = clanIdRaw ? Number(clanIdRaw) : NaN;
  if (!Number.isFinite(clanId)) {
    return new Response('Missing clan_id', { status: 400 });
  }

  try {
    const clanMap = await wg<Record<string, ClanInfo>>('/clans/info/', {
      clan_id: String(clanId),
      fields:
        'clan_id,members_count,members.account_id,members.account_name,members.role,name,tag',
    });
    const clan = clanMap?.[String(clanId)];
    if (!clan) return new Response('Clan not found', { status: 404 });

    const rawMembers = Array.isArray(clan.members) ? clan.members : [];
    const members = rawMembers.filter(
      (m): m is ClanMember =>
        !!m &&
        typeof m.account_id === 'number' &&
        Number.isFinite(m.account_id) &&
        m.account_id > 0,
    );

    if (members.length === 0) {
      return new Response(JSON.stringify(EMPTY_PAYLOAD(clan)), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=300, s-maxage=300',
        },
      });
    }

    const memberIds = members.map((m) => m.account_id);
    const [accountMap, tomatoMap] = await Promise.all([
      fetchAccountsInfo(members),
      fetchTomatoBulkStats(memberIds),
    ]);

    const now = Math.floor(Date.now() / 1000);
    const DAY = 86400;
    const ONLINE_WINDOW = 1800;

    let onlineNow = 0;
    let active24h = 0;
    let active7d = 0;
    let sumWn8 = 0; let sumWn8Count = 0;
    let sumWinRate = 0; let sumWinRateCount = 0;
    let sumGr = 0; let sumGrCount = 0;
    let sumDmg = 0; let sumDmgCount = 0;
    let sumFrags = 0; let sumSpots = 0; let sumFragsSpotsBattles = 0;
    let totalBattles = 0;
    let sampledMembers = 0;
    let maxWn8: number | null = null;
    let maxWn8Nickname: string | null = null;

    const perPlayer: ClanStatsPayload['topPlayers'] = [];

    for (const m of members) {
      const acc = accountMap?.[String(m.account_id)];
      if (!acc) continue;
      sampledMembers++;

      const tomato = tomatoMap[String(m.account_id)];
      const wn8 = tomato?.overall?.wn8 ?? null;
      const winRate = tomato?.overall?.winrate ?? null;
      const recentWn8 = tomato?.recent?.wn8 ?? null;
      const recentWinRate = tomato?.recent?.winrate ?? null;
      const battles = tomato?.overall?.battles ?? 0;

      // Damage/frags/spots come from WG account info (not in tomato bulk-stats).
      const s = acc.statistics.random ?? acc.statistics.all;
      const wgBattles = s.battles ?? 0;
      const dpb = wgBattles > 0 ? s.damage_dealt / wgBattles : null;

      if (wn8 != null) {
        sumWn8 += wn8;
        sumWn8Count++;
        if (maxWn8 == null || wn8 > maxWn8) {
          maxWn8 = wn8;
          maxWn8Nickname = acc.nickname;
        }
      }
      if (winRate != null) {
        sumWinRate += winRate;
        sumWinRateCount++;
      }
      if (acc.global_rating) {
        sumGr += acc.global_rating;
        sumGrCount++;
      }
      if (dpb != null) {
        sumDmg += dpb;
        sumDmgCount++;
      }
      if (wgBattles > 0) {
        sumFrags += s.frags ?? 0;
        sumSpots += s.spotted ?? 0;
        sumFragsSpotsBattles += wgBattles;
      }
      totalBattles += battles;

      const lastBattle = acc.last_battle_time ?? 0;
      const logout = acc.logout_at ?? 0;
      if (
        now - lastBattle < ONLINE_WINDOW &&
        (logout === 0 || lastBattle >= logout)
      ) {
        onlineNow++;
      }
      if (now - lastBattle < DAY) active24h++;
      if (now - lastBattle < 7 * DAY) active7d++;

      perPlayer.push({
        accountId: acc.account_id,
        nickname: acc.nickname,
        role: m.role,
        wn8,
        winRate,
        battles,
        globalRating: acc.global_rating,
        lastBattleTime: lastBattle,
        recentWn8,
        recentWinRate,
      });
    }

    const topPlayers = perPlayer
      .filter((p) => p.wn8 != null)
      .sort((a, b) => (b.wn8 ?? 0) - (a.wn8 ?? 0))
      .slice(0, 8);

    const payload: ClanStatsPayload = {
      clanId: clan.clan_id,
      name: clan.name,
      tag: clan.tag,
      membersCount: clan.members_count ?? members.length,
      sampledMembers,
      onlineNow,
      active24h,
      active7d,
      avgWinRate: sumWinRateCount ? sumWinRate / sumWinRateCount : null,
      avgWn8: sumWn8Count ? sumWn8 / sumWn8Count : null,
      avgGlobalRating: sumGrCount ? sumGr / sumGrCount : null,
      avgDamagePerBattle: sumDmgCount ? sumDmg / sumDmgCount : null,
      avgFragsPerBattle:
        sumFragsSpotsBattles > 0 ? sumFrags / sumFragsSpotsBattles : null,
      avgSpotsPerBattle:
        sumFragsSpotsBattles > 0 ? sumSpots / sumFragsSpotsBattles : null,
      totalBattles,
      maxWn8,
      maxWn8Nickname,
      topPlayers,
      computedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('[clan-stats] internal error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }
};
