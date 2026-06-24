import type { Context } from '@netlify/functions';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_ID = process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ?? '';
const WG_BASE = 'https://api.worldoftanks.eu/wot';
const BATCH_SIZE = 100;

interface WgAccountInfo {
  account_id: number;
  last_battle_time: number;
  statistics: { all: { battles: number } };
}

interface SnapshotRow {
  player_id: string;
  account_id: number;
  snapshot_date: string;
  captured_at: string;
  last_battle_at: string | null;
  battles: number;
  battles_delta: number | null;
  active_day: boolean;
  source: string;
  meta: Record<string, unknown>;
}

function corsHeaders(origin: string): Record<string, string> {
  const allowed = ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  const allowOrigin =
    origin && allowed.length > 0 && allowed.includes(origin) ? origin : 'null';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'POST, OPTIONS',
    'content-type': 'application/json',
    vary: 'origin',
  };
}

async function isAdmin(authHeader: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      authorization: authHeader,
      'content-type': 'application/json',
    },
    body: '{}',
  });
  if (!res.ok) return false;
  return (await res.json().catch(() => false)) === true;
}

async function supabaseGet<T>(path: string, params: Record<string, string> = {}): Promise<T[]> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Supabase not configured');
  const qs = new URLSearchParams(params);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}?${qs}`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Supabase GET ${path} failed (${res.status})`);
  return res.json() as Promise<T[]>;
}

async function supabaseUpsert(table: string, rows: unknown[]): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Supabase not configured');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Supabase upsert ${table} failed (${res.status}): ${detail}`);
  }
}

async function supabasePatch(
  table: string,
  filter: string,
  body: Record<string, unknown>,
): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Supabase not configured');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Supabase PATCH ${table} failed (${res.status}): ${detail}`);
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function handler(req: Request, _ctx: Context): Promise<Response> {
  const origin = req.headers.get('origin') ?? '';
  const headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }
  if (!(await isAdmin(authHeader))) {
    return new Response(JSON.stringify({ error: 'Admin role required' }), { status: 403, headers });
  }

  if (!APP_ID) {
    return new Response(JSON.stringify({ error: 'WOT_APPLICATION_ID not configured' }), {
      status: 503, headers,
    });
  }

  const today = isoDate(new Date());
  const lookbackFrom = isoDate(new Date(Date.now() - 30 * 86_400_000));

  let players: Array<{ id: string; account_id: number }>;
  try {
    players = await supabaseGet<{ id: string; account_id: number }>(
      'players',
      { select: 'id,account_id', 'account_id': 'not.is.null', 'status': 'neq.former' },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers });
  }

  if (players.length === 0) {
    return new Response(JSON.stringify({ snapshots: 0, errors: 0, players: 0 }), {
      status: 200, headers,
    });
  }

  // Most recent snapshot before today for each account (not strictly
  // "yesterday") — a missed run shouldn't permanently null out the delta.
  let prevSnapshots: Array<{ account_id: number; battles: number; snapshot_date: string }> = [];
  try {
    prevSnapshots = await supabaseGet<{
      account_id: number;
      battles: number;
      snapshot_date: string;
    }>('player_activity_snapshots', {
      select: 'account_id,battles,snapshot_date',
      and: `(snapshot_date.gte.${lookbackFrom},snapshot_date.lt.${today})`,
      order: 'snapshot_date.desc',
    });
  } catch {
    // non-fatal — battles_delta will be null for all
  }

  const prevBattles = new Map<number, number>();
  for (const s of prevSnapshots) {
    if (!prevBattles.has(s.account_id)) {
      prevBattles.set(s.account_id, s.battles);
    }
  }
  const batches = chunk(players, BATCH_SIZE);
  let totalInserted = 0;
  let totalErrors = 0;

  for (const batch of batches) {
    const accountIds = batch.map((p) => p.account_id);
    const qs = new URLSearchParams({
      application_id: APP_ID,
      account_id: accountIds.join(','),
      fields: 'account_id,last_battle_time,statistics.all.battles',
    });

    let wgData: Record<string, WgAccountInfo | null>;
    try {
      const res = await fetch(`${WG_BASE}/account/info/?${qs}`);
      if (!res.ok) throw new Error(`WoT ${res.status}`);
      const json = (await res.json()) as {
        status: string;
        error?: { message: string };
        data: Record<string, WgAccountInfo | null>;
      };
      if (json.status !== 'ok') throw new Error(json.error?.message ?? 'WoT error');
      wgData = json.data;
    } catch (err) {
      console.error('[snapshot-trigger] WoT batch failed:', err);
      totalErrors += batch.length;
      continue;
    }

    const snapshots: SnapshotRow[] = [];
    const activityUpdates: Array<{ id: string; last_battle_at: string }> = [];

    for (const player of batch) {
      const info = wgData[String(player.account_id)];
      if (!info) continue;

      const battles = info.statistics?.all?.battles ?? 0;
      const prev = prevBattles.get(player.account_id) ?? null;
      const battlesDelta = prev !== null ? battles - prev : null;
      const lastBattleAt =
        info.last_battle_time > 0
          ? new Date(info.last_battle_time * 1000).toISOString()
          : null;

      snapshots.push({
        player_id: player.id,
        account_id: player.account_id,
        snapshot_date: today,
        captured_at: new Date().toISOString(),
        last_battle_at: lastBattleAt,
        battles,
        battles_delta: battlesDelta,
        active_day: (battlesDelta ?? 0) > 0,
        source: 'manual',
        meta: {},
      });

      if (lastBattleAt) {
        activityUpdates.push({ id: player.id, last_battle_at: lastBattleAt });
      }
    }

    if (snapshots.length > 0) {
      try {
        await supabaseUpsert('player_activity_snapshots', snapshots);
        totalInserted += snapshots.length;
      } catch (err) {
        console.error('[snapshot-trigger] upsert error:', err);
        totalErrors += snapshots.length;
      }
    }

    for (const u of activityUpdates) {
      try {
        await supabasePatch(
          'players',
          `id=eq.${u.id}&last_wot_activity_at=lt.${u.last_battle_at}`,
          { last_wot_activity_at: u.last_battle_at },
        );
      } catch {
        // non-fatal
      }
    }
  }

  return new Response(
    JSON.stringify({ snapshots: totalInserted, errors: totalErrors, players: players.length }),
    { status: 200, headers },
  );
}
