import type { Context } from '@netlify/functions';

// ---------------------------------------------------------------------------
// WN8 via Wargaming API + XVM expected-values table.
// Replaces the old tomato.gg passthrough (their /dev API is allowlisted).
// ---------------------------------------------------------------------------

const APP_ID = process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;
const WG_BASE = 'https://api.worldoftanks.eu/wot';
const EXP_URL = 'https://static.modxvm.com/wn8-data-exp/json/wn8exp.json';

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

interface TankStats {
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

interface TankInfo {
  tank_id: number;
  tier: number;
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
      frags: number;
      spotted: number;
      dropped_capture_points: number;
    };
  };
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

function computeWn8(tanks: TankStats[], expected: Map<number, ExpectedValue>): number | null {
  let n = 0;
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
    n++;
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

  if (n === 0 || battles === 0 || expDmg === 0) return null;

  const rDmg = d / expDmg;
  const rSpot = expSpot > 0 ? s / expSpot : 0;
  const rFrag = expFrag > 0 ? f / expFrag : 0;
  const rDef = expDef > 0 ? def / expDef : 0;
  const rWin = expWin > 0 ? (win / battles) * 100 / (expWin / battles) : 0;

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

// Tank tier lookup (cached forever — tank list doesn't change often).
let tierCache: Map<number, number> | null = null;
async function getTierMap(): Promise<Map<number, number>> {
  if (tierCache) return tierCache;
  const data = await wg<Record<string, TankInfo>>('/encyclopedia/vehicles/', {
    fields: 'tank_id,tier',
  });
  const map = new Map<number, number>();
  for (const v of Object.values(data)) map.set(v.tank_id, v.tier);
  tierCache = map;
  return map;
}

export interface PlayerStatsPayload {
  accountId: number;
  nickname: string;
  winRate: number | null;
  battles: number;
  damagePerBattle: number | null;
  wn8: number | null;
  tier10Count: number;
  globalRating: number;
  lastBattleTime: number;
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const url = new URL(req.url);
  const id = url.searchParams.get('account_id');
  const accountId = id ? Number(id) : NaN;
  if (!Number.isFinite(accountId)) {
    return new Response('Missing account_id', { status: 400 });
  }

  try {
    const [accountMap, tankStats, expected, tierMap] = await Promise.all([
      wg<Record<string, AccountInfo>>('/account/info/', {
        account_id: String(accountId),
        fields:
          'account_id,nickname,last_battle_time,global_rating,statistics.all.battles,statistics.all.wins,statistics.all.damage_dealt',
      }),
      wg<Record<string, TankStats[]>>('/tanks/stats/', {
        account_id: String(accountId),
        fields:
          'tank_id,all.battles,all.wins,all.damage_dealt,all.frags,all.spotted,all.dropped_capture_points',
      }),
      getExpected(),
      getTierMap(),
    ]);

    const account = accountMap?.[String(accountId)];
    const tanks = tankStats?.[String(accountId)] ?? [];
    if (!account) return new Response('Player not found', { status: 404 });

    const a = account.statistics.all;
    const winRate = a.battles > 0 ? (a.wins / a.battles) * 100 : null;
    const damagePerBattle = a.battles > 0 ? a.damage_dealt / a.battles : null;
    const wn8 = computeWn8(tanks, expected);
    let tier10Count = 0;
    for (const t of tanks) {
      if (tierMap.get(t.tank_id) === 10 && t.all.battles > 0) tier10Count++;
    }

    const payload: PlayerStatsPayload = {
      accountId: account.account_id,
      nickname: account.nickname,
      winRate,
      battles: a.battles,
      damagePerBattle,
      wn8,
      tier10Count,
      globalRating: account.global_rating,
      lastBattleTime: account.last_battle_time,
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
