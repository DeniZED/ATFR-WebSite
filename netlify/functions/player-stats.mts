import type { Context } from '@netlify/functions';

const APP_ID = process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;
const TOMATO_API_KEY = process.env.TOMATO_API_KEY;
const WG_BASE = 'https://api.worldoftanks.eu/wot';
const TOMATO_BASE = 'https://api.tomato.gg';

interface TankStats {
  tank_id: number;
  random?: { battles: number };
  all?: { battles: number };
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
    random?: {
      battles: number;
      wins: number;
      damage_dealt: number;
    };
    all: {
      battles: number;
      wins: number;
      damage_dealt: number;
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

async function fetchTomatoStats(accountId: number): Promise<TomatoBulkPlayer | null> {
  if (!TOMATO_API_KEY) return null;
  try {
    const res = await fetch(
      `${TOMATO_BASE}/api/player/bulk-stats/eu?ids=${accountId}`,
      { headers: { 'x-api-key': TOMATO_API_KEY } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      meta: { status: string };
      data: Record<string, TomatoBulkPlayer>;
    };
    return json.data?.[String(accountId)] ?? null;
  } catch {
    return null;
  }
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
    const [accountMap, tankStats, tierMap, tomatoData] = await Promise.all([
      wg<Record<string, AccountInfo>>('/account/info/', {
        account_id: String(accountId),
        fields:
          'account_id,nickname,last_battle_time,global_rating,' +
          'statistics.all.battles,statistics.all.wins,statistics.all.damage_dealt,' +
          'statistics.random.battles,statistics.random.wins,statistics.random.damage_dealt',
      }),
      wg<Record<string, TankStats[]>>('/tanks/stats/', {
        account_id: String(accountId),
        fields: 'tank_id,random.battles,all.battles',
      }),
      getTierMap(),
      fetchTomatoStats(accountId),
    ]);

    const account = accountMap?.[String(accountId)];
    const tanks = tankStats?.[String(accountId)] ?? [];
    if (!account) return new Response('Player not found', { status: 404 });

    const s = account.statistics.random ?? account.statistics.all;
    const battles = s.battles ?? 0;
    const damagePerBattle = battles > 0 ? s.damage_dealt / battles : null;

    // Prefer tomato.gg values; fall back to WG computation if tomato has no data.
    const wn8 = tomatoData?.overall?.wn8 ?? null;
    const winRate =
      tomatoData?.overall?.winrate ??
      (battles > 0 ? (s.wins / battles) * 100 : null);

    let tier10Count = 0;
    for (const t of tanks) {
      const b = t.random?.battles ?? t.all?.battles ?? 0;
      if (tierMap.get(t.tank_id) === 10 && b > 0) tier10Count++;
    }

    const payload: PlayerStatsPayload = {
      accountId: account.account_id,
      nickname: account.nickname,
      winRate,
      battles,
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
    console.error('[player-stats] internal error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }
};
