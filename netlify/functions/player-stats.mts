import type { Context } from '@netlify/functions';
import { z } from 'zod';

const APP_ID = process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;
const TOMATO_API_KEY = process.env.TOMATO_API_KEY;
const WG_BASE = 'https://api.worldoftanks.eu/wot';
const TOMATO_BASE = 'https://api.tomato.gg';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAX_BATCH_IDS = 50;

// Runtime schema — catches silent WG API shape changes before they corrupt stats.
const StatBlockSchema = z.object({
  battles: z.number().default(0),
  wins: z.number().default(0),
  damage_dealt: z.number().default(0),
});

const AccountInfoSchema = z.record(
  z.object({
    account_id: z.number(),
    nickname: z.string(),
    last_battle_time: z.number().default(0),
    global_rating: z.number().default(0),
    statistics: z.object({
      random: StatBlockSchema.optional(),
      all: StatBlockSchema,
    }),
  }).nullable(),
);

const TankStatsSchema = z.record(
  z.array(
    z.object({
      tank_id: z.number(),
      random: z.object({ battles: z.number() }).optional(),
      all: z.object({ battles: z.number() }).optional(),
    }),
  ).nullable(),
);

interface TankInfo {
  tank_id: number;
  tier: number;
}

// Tous les champs sont optionnels/nullable : tomato.gg a introduit WNX en
// 2025 en plus du WN8 (pas en remplacement, selon leur propre annonce), donc
// on valide la forme réelle de la réponse au lieu de la supposer figée — un
// champ renommé ou retiré doit se voir dans les logs, pas disparaître en
// silence derrière un wn8 toujours nul.
const TomatoStatSummarySchema = z
  .object({
    battles: z.number().nullable().optional(),
    wn8: z.number().nullable().optional(),
    wnx: z.number().nullable().optional(),
    winrate: z.number().nullable().optional(),
    avgTier: z.number().nullable().optional(),
  })
  .passthrough();

const TomatoBulkPlayerSchema = z
  .object({
    recent: TomatoStatSummarySchema.nullable().optional(),
    overall: TomatoStatSummarySchema.nullable().optional(),
  })
  .passthrough();

const TomatoBulkResponseSchema = z
  .object({
    data: z.record(TomatoBulkPlayerSchema).optional(),
  })
  .passthrough();

type TomatoBulkPlayer = z.infer<typeof TomatoBulkPlayerSchema>;

interface RecruitmentSettings {
  min_wn8: number;
  min_battles: number;
  weight_wn8: number;
  weight_winrate: number;
  weight_battles: number;
  weight_tier10: number;
}

const DEFAULT_RECRUITMENT_SETTINGS: RecruitmentSettings = {
  min_wn8: 0,
  min_battles: 0,
  weight_wn8: 40,
  weight_winrate: 20,
  weight_battles: 15,
  weight_tier10: 25,
};

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

async function fetchTomatoStats(accountIds: number[]): Promise<Record<string, TomatoBulkPlayer>> {
  if (!TOMATO_API_KEY || accountIds.length === 0) return {};
  try {
    const res = await fetch(
      `${TOMATO_BASE}/api/player/bulk-stats/eu?ids=${accountIds.join(',')}`,
      { headers: { 'x-api-key': TOMATO_API_KEY } },
    );
    if (!res.ok) {
      console.error(`[player-stats] tomato.gg bulk-stats HTTP ${res.status}`);
      return {};
    }
    const json = await res.json();
    const parsed = TomatoBulkResponseSchema.safeParse(json);
    if (!parsed.success) {
      console.error('[player-stats] unexpected tomato.gg bulk-stats shape:', parsed.error.issues[0]?.message);
      return {};
    }
    const data = parsed.data.data ?? {};
    // Filet de sécurité : si tomato.gg renomme/retire wn8 ET wnx alors qu'il
    // renvoie bien des données (battles > 0), on le veut dans les logs plutôt
    // que de laisser le recrutement tourner silencieusement sans WN8.
    const players = Object.values(data);
    const withBattles = players.filter((p) => (p.overall?.battles ?? 0) > 0);
    const allMissingScore = withBattles.length > 0 && withBattles.every(
      (p) => p.overall?.wn8 == null && p.overall?.wnx == null,
    );
    if (allMissingScore) {
      console.error(
        `[player-stats] tomato.gg returned ${withBattles.length} player(s) with battles but no wn8/wnx — possible API field rename`,
      );
    }
    return data;
  } catch (err) {
    console.error('[player-stats] tomato.gg bulk-stats fetch failed:', err);
    return {};
  }
}

// Lit la config de score de recrutement (Admin > Paramètres). Retombe sur les
// poids par défaut si Supabase n'est pas configuré ou en cas d'échec — le
// calcul du score ne doit jamais faire planter la réponse.
async function fetchRecruitmentSettings(): Promise<RecruitmentSettings> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return DEFAULT_RECRUITMENT_SETTINGS;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/recruitment_settings?id=eq.true&select=*`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          accept: 'application/json',
        },
      },
    );
    if (!res.ok) return DEFAULT_RECRUITMENT_SETTINGS;
    const rows = (await res.json()) as RecruitmentSettings[];
    return rows[0] ?? DEFAULT_RECRUITMENT_SETTINGS;
  } catch {
    return DEFAULT_RECRUITMENT_SETTINGS;
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Score 0-100 = moyenne pondérée de quatre facteurs normalisés (WN8, winrate,
// expérience en batailles, nombre de tier 10). Un facteur sans donnée est
// simplement exclu de la moyenne (son poids n'est pas compté) plutôt que de
// pénaliser le joueur.
function computeRecruitmentScore(
  stats: { wn8: number | null; winRate: number | null; battles: number; tier10Count: number },
  settings: RecruitmentSettings,
): number | null {
  const factors: Array<{ value: number | null; weight: number }> = [
    { value: stats.wn8 != null ? clamp01(stats.wn8 / 3400) * 100 : null, weight: settings.weight_wn8 },
    {
      value: stats.winRate != null ? clamp01((stats.winRate - 42) / (60 - 42)) * 100 : null,
      weight: settings.weight_winrate,
    },
    { value: clamp01(stats.battles / 20000) * 100, weight: settings.weight_battles },
    { value: clamp01(stats.tier10Count / 8) * 100, weight: settings.weight_tier10 },
  ];

  let weightedSum = 0;
  let weightTotal = 0;
  for (const factor of factors) {
    if (factor.value == null || factor.weight <= 0) continue;
    weightedSum += factor.value * factor.weight;
    weightTotal += factor.weight;
  }
  if (weightTotal === 0) return null;
  return Math.round(weightedSum / weightTotal);
}

export interface PlayerStatsPayload {
  accountId: number;
  nickname: string;
  winRate: number | null;
  battles: number;
  damagePerBattle: number | null;
  wn8: number | null;
  wnx: number | null;
  avgTier: number | null;
  tier10Count: number;
  globalRating: number;
  lastBattleTime: number;
  recent: {
    battles: number | null;
    winRate: number | null;
    wn8: number | null;
    wnx: number | null;
    avgTier: number | null;
  } | null;
  recruitmentScore: number | null;
  recruitmentThresholds: { minWn8: number; minBattles: number };
}

async function buildPayloads(accountIds: number[]): Promise<Map<number, PlayerStatsPayload>> {
  const idsParam = accountIds.join(',');
  const [rawAccount, rawTanks, tierMap, tomatoData, settings] = await Promise.all([
    wg<unknown>('/account/info/', {
      account_id: idsParam,
      fields:
        'account_id,nickname,last_battle_time,global_rating,' +
        'statistics.all.battles,statistics.all.wins,statistics.all.damage_dealt,' +
        'statistics.random.battles,statistics.random.wins,statistics.random.damage_dealt',
    }),
    wg<unknown>('/tanks/stats/', {
      account_id: idsParam,
      fields: 'tank_id,random.battles,all.battles',
    }),
    getTierMap(),
    fetchTomatoStats(accountIds),
    fetchRecruitmentSettings(),
  ]);

  const accountParsed = AccountInfoSchema.safeParse(rawAccount);
  if (!accountParsed.success) {
    console.error('[player-stats] unexpected account/info shape:', accountParsed.error.issues[0]?.message);
    throw new Error('Stats unavailable');
  }
  const tanksParsed = TankStatsSchema.safeParse(rawTanks);

  const result = new Map<number, PlayerStatsPayload>();
  for (const accountId of accountIds) {
    const account = accountParsed.data[String(accountId)];
    if (!account) continue;
    const tanks = (tanksParsed.success ? tanksParsed.data[String(accountId)] : null) ?? [];

    const s = account.statistics.random ?? account.statistics.all;
    const battles = s.battles ?? 0;
    const damagePerBattle = battles > 0 ? s.damage_dealt / battles : null;

    const tomatoPlayer = tomatoData[String(accountId)];
    // Préfère les valeurs tomato.gg ; retombe sur le calcul WG si tomato n'a pas de données.
    const wn8 = tomatoPlayer?.overall?.wn8 ?? null;
    const wnx = tomatoPlayer?.overall?.wnx ?? null;
    const winRate =
      tomatoPlayer?.overall?.winrate ?? (battles > 0 ? (s.wins / battles) * 100 : null);
    const avgTier = tomatoPlayer?.overall?.avgTier ?? null;

    let tier10Count = 0;
    for (const t of tanks) {
      const b = t.random?.battles ?? t.all?.battles ?? 0;
      if (tierMap.get(t.tank_id) === 10 && b > 0) tier10Count++;
    }

    const recruitmentScore = computeRecruitmentScore({ wn8, winRate, battles, tier10Count }, settings);

    result.set(accountId, {
      accountId: account.account_id,
      nickname: account.nickname,
      winRate,
      battles,
      damagePerBattle,
      wn8,
      wnx,
      avgTier,
      tier10Count,
      globalRating: account.global_rating,
      lastBattleTime: account.last_battle_time,
      recent: tomatoPlayer?.recent
        ? {
            battles: tomatoPlayer.recent.battles ?? null,
            winRate: tomatoPlayer.recent.winrate ?? null,
            wn8: tomatoPlayer.recent.wn8 ?? null,
            wnx: tomatoPlayer.recent.wnx ?? null,
            avgTier: tomatoPlayer.recent.avgTier ?? null,
          }
        : null,
      recruitmentScore,
      recruitmentThresholds: { minWn8: settings.min_wn8, minBattles: settings.min_battles },
    });
  }
  return result;
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get('account_ids');
  const singleId = url.searchParams.get('account_id');

  let accountIds: number[];
  let single = false;
  if (idsParam) {
    accountIds = [...new Set(idsParam.split(',').map((s) => Number(s.trim())).filter(Number.isFinite))].slice(
      0,
      MAX_BATCH_IDS,
    );
    if (accountIds.length === 0) {
      return new Response('Missing account_ids', { status: 400 });
    }
  } else {
    const accountId = singleId ? Number(singleId) : NaN;
    if (!Number.isFinite(accountId)) {
      return new Response('Missing account_id', { status: 400 });
    }
    accountIds = [accountId];
    single = true;
  }

  try {
    const payloads = await buildPayloads(accountIds);

    if (single) {
      const payload = payloads.get(accountIds[0]);
      if (!payload) return new Response('Player not found', { status: 404 });
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=300',
        },
      });
    }

    return new Response(JSON.stringify({ players: [...payloads.values()] }), {
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
