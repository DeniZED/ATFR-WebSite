import type { Context } from '@netlify/functions';

const APP_ID = process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;
const CLAN_ID = process.env.CLAN_ID || process.env.VITE_CLAN_ID;
const WG_BASE = 'https://api.worldoftanks.eu/wot';
const EXP_URL = 'https://static.modxvm.com/wn8-data-exp/json/wn8exp.json';
const SAMPLE_SIZE = 20;

interface ExpectedValue {
  IDNum: number;
  expDamage: number;
  expSpot: number;
  expFrag: number;
  expDef: number;
  expWinRate: number;
}

let expCache: Map<number, ExpectedValue> | null = null;
let expCacheAt = 0;

async function getExpected(): Promise<Map<number, ExpectedValue>> {
  if (expCache && Date.now() - expCacheAt < 24 * 60 * 60 * 1000) return expCache;
  const res = await fetch(EXP_URL);
  if (!res.ok) throw new Error('Failed to fetch WN8 expected values');
  const json = (await res.json()) as { data: ExpectedValue[] };
  const map = new Map<number, ExpectedValue>();
  for (const e of json.data) map.set(e.IDNum, e);
  expCache = map;
  expCacheAt = Date.now();
  return map;
}

async function wg<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!APP_ID) throw new Error('WOT_APPLICATION_ID missing');
  const qs = new URLSearchParams({ application_id: APP_ID, ...params });
  const res = await fetch(`${WG_BASE}${path}?${qs}`);
  if (!res.ok) throw new Error(`WG ${path} ${res.status}`);
  const json = (await res.json()) as { status: string; error?: { message: string }; data: T };
  if (json.status !== 'ok') {
    throw new Error(`WG error: ${json.error?.message ?? 'unknown'}`);
  }
  return json.data;
}

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

interface TankStatsRow {
  tank_id: number;
  all: {
    battles: number;
    wins: number;
    damage_dealt: number;
    frags: number;
    spotted: number;
    dropped_capture_points: number;
  };
}

interface AccountInfo {
  account_id: number;
  nickname: string;
  last_battle_time: number;
  global_rating: number;
  statistics: {
    all: {
      battles: number;
      wins: number;
      damage_dealt: number;
    };
  };
}

function computeWn8(
  tanks: TankStatsRow[],
  expected: Map<number, ExpectedValue>,
): number | null {
  let d = 0;
  let s = 0;
  let f = 0;
  let def = 0;
  let win = 0;
  let battles = 0;
  let expDmg = 0;
  let expSpot = 0;
  let expFrag = 0;
  let expDef = 0;
  let expWin = 0;

  for (const t of tanks) {
    const exp = expected.get(t.tank_id);
    if (!exp || t.all.battles <= 0) continue;
    battles += t.all.battles;
    d += t.all.damage_dealt;
    s += t.all.spotted;
    f += t.all.frags;
    def += t.all.dropped_capture_points;
    win += t.all.wins;
    expDmg += exp.expDamage * t.all.battles;
    expSpot += exp.expSpot * t.all.battles;
    expFrag += exp.expFrag * t.all.battles;
    expDef += exp.expDef * t.all.battles;
    expWin += exp.expWinRate * t.all.battles;
  }

  if (battles === 0 || expDmg === 0) return null;
  const rDmg = d / expDmg;
  const rSpot = expSpot > 0 ? s / expSpot : 0;
  const rFrag = expFrag > 0 ? f / expFrag : 0;
  const rDef = expDef > 0 ? def / expDef : 0;
  const rWin = expWin > 0 ? ((win / battles) * 100) / (expWin / battles) : 0;

  const rDAMAGE = Math.max(0, (rDmg - 0.22) / 0.78);
  const rSPOT = Math.max(0, Math.min(rDAMAGE + 0.1, (rSpot - 0.38) / 0.62));
  const rFRAG = Math.max(0, Math.min(rDAMAGE + 0.2, (rFrag - 0.12) / 0.88));
  const rDEF = Math.max(0, Math.min(rDAMAGE + 0.1, (rDef - 0.1) / 0.9));
  const rWIN = Math.max(0, (rWin - 0.71) / 0.29);

  return (
    980 * rDAMAGE +
    210 * rDAMAGE * rFRAG +
    155 * rFRAG * rSPOT +
    75 * rDEF * rFRAG +
    145 * Math.min(1.8, rWIN)
  );
}

export interface ClanStatsPayload {
  clanId: number | null;
  name: string | null;
  tag: string | null;
  membersCount: number;
  active24h: number;
  active7d: number;
  avgWinRate: number | null;
  avgWn8: number | null;
  avgGlobalRating: number | null;
  avgDamagePerBattle: number | null;
  totalBattles: number;
  topPlayers: Array<{
    accountId: number;
    nickname: string;
    role: string;
    wn8: number | null;
    winRate: number | null;
    battles: number;
    globalRating: number;
    lastBattleTime: number;
  }>;
  computedAt: string;
}

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
      fields: 'clan_id,members_count,members.account_id,members.account_name,members.role,name,tag',
    });
    const clan = clanMap?.[String(clanId)];
    if (!clan) return new Response('Clan not found', { status: 404 });

    const sample = clan.members.slice(0, SAMPLE_SIZE);
    const ids = sample.map((m) => m.account_id).join(',');

    const [accountMap, tankStats, expected] = await Promise.all([
      wg<Record<string, AccountInfo>>('/account/info/', {
        account_id: ids,
        fields:
          'account_id,nickname,last_battle_time,global_rating,statistics.all.battles,statistics.all.wins,statistics.all.damage_dealt',
      }),
      wg<Record<string, TankStatsRow[]>>('/tanks/stats/', {
        account_id: ids,
        fields:
          'tank_id,all.battles,all.wins,all.damage_dealt,all.frags,all.spotted,all.dropped_capture_points',
      }),
      getExpected(),
    ]);

    const now = Math.floor(Date.now() / 1000);
    const DAY = 86400;

    let active24h = 0;
    let active7d = 0;
    let sumWin = 0;
    let sumWinCount = 0;
    let sumWn8 = 0;
    let sumWn8Count = 0;
    let sumGr = 0;
    let sumGrCount = 0;
    let sumDmg = 0;
    let sumDmgCount = 0;
    let totalBattles = 0;

    const perPlayer: ClanStatsPayload['topPlayers'] = [];

    for (const m of sample) {
      const acc = accountMap?.[String(m.account_id)];
      if (!acc) continue;
      const a = acc.statistics.all;
      const wr = a.battles > 0 ? (a.wins / a.battles) * 100 : null;
      const dpb = a.battles > 0 ? a.damage_dealt / a.battles : null;
      const tanks = tankStats?.[String(m.account_id)] ?? [];
      const wn8 = computeWn8(tanks, expected);

      if (wr != null) {
        sumWin += wr;
        sumWinCount++;
      }
      if (wn8 != null) {
        sumWn8 += wn8;
        sumWn8Count++;
      }
      if (acc.global_rating) {
        sumGr += acc.global_rating;
        sumGrCount++;
      }
      if (dpb != null) {
        sumDmg += dpb;
        sumDmgCount++;
      }
      totalBattles += a.battles;

      const lastBattle = acc.last_battle_time ?? 0;
      if (now - lastBattle < DAY) active24h++;
      if (now - lastBattle < 7 * DAY) active7d++;

      perPlayer.push({
        accountId: acc.account_id,
        nickname: acc.nickname,
        role: m.role,
        wn8,
        winRate: wr,
        battles: a.battles,
        globalRating: acc.global_rating,
        lastBattleTime: lastBattle,
      });
    }

    const topPlayers = perPlayer
      .sort((a, b) => (b.wn8 ?? 0) - (a.wn8 ?? 0))
      .slice(0, 8);

    const payload: ClanStatsPayload = {
      clanId: clan.clan_id,
      name: clan.name,
      tag: clan.tag,
      membersCount: clan.members_count,
      active24h,
      active7d,
      avgWinRate: sumWinCount ? sumWin / sumWinCount : null,
      avgWn8: sumWn8Count ? sumWn8 / sumWn8Count : null,
      avgGlobalRating: sumGrCount ? sumGr / sumGrCount : null,
      avgDamagePerBattle: sumDmgCount ? sumDmg / sumDmgCount : null,
      totalBattles,
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
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }
};
