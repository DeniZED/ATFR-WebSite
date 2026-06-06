import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
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
  const allowed = ALLOWED_ORIGINS
    ? ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : [];
  const allowOrigin = allowed.length === 0 || allowed.includes(origin) ? origin : '';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'POST, OPTIONS',
    'content-type': 'application/json',
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function handler(req: Request, ctx: Context): Promise<Response> {
  const origin = req.headers.get('origin') ?? '';
  const headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Supabase service role not configured' }), {
      status: 503, headers,
    });
  }

  // Auth: require admin Supabase JWT
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  const anonClient = createClient(SUPABASE_URL, token, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers });
  }

  // Verify admin role
  const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: roleRow } = await serviceClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  const role = roleRow?.role ?? '';
  if (!['admin', 'super_admin'].includes(role)) {
    return new Response(JSON.stringify({ error: 'Admin role required' }), { status: 403, headers });
  }

  if (!APP_ID) {
    return new Response(JSON.stringify({ error: 'WOT_APPLICATION_ID not configured' }), {
      status: 503, headers,
    });
  }

  void ctx; // unused but required by type

  const today = isoDate(new Date());
  const yesterday = isoDate(new Date(Date.now() - 86_400_000));

  const { data: players, error: playersError } = await serviceClient
    .from('players')
    .select('id, account_id, nickname')
    .not('account_id', 'is', null)
    .neq('status', 'former');

  if (playersError) {
    return new Response(JSON.stringify({ error: playersError.message }), { status: 500, headers });
  }
  if (!players || players.length === 0) {
    return new Response(JSON.stringify({ snapshots: 0, errors: 0 }), { status: 200, headers });
  }

  const { data: prevSnapshots } = await serviceClient
    .from('player_activity_snapshots')
    .select('account_id, battles')
    .eq('snapshot_date', yesterday);

  const prevBattles = new Map<number, number>(
    (prevSnapshots ?? []).map((s) => [s.account_id as number, s.battles as number]),
  );

  const batches = chunk(players, BATCH_SIZE);
  let totalInserted = 0;
  let totalErrors = 0;

  for (const batch of batches) {
    const accountIds = batch.map((p) => p.account_id as number);
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
      const prev = prevBattles.get(player.account_id as number) ?? null;
      const battlesDelta = prev !== null ? battles - prev : null;
      const lastBattleAt =
        info.last_battle_time > 0
          ? new Date(info.last_battle_time * 1000).toISOString()
          : null;

      snapshots.push({
        player_id: player.id as string,
        account_id: player.account_id as number,
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
        activityUpdates.push({ id: player.id as string, last_battle_at: lastBattleAt });
      }
    }

    if (snapshots.length > 0) {
      const { error } = await serviceClient
        .from('player_activity_snapshots')
        .upsert(snapshots, { onConflict: 'player_id,snapshot_date' });
      if (error) {
        console.error('[snapshot-trigger] upsert error:', error.message);
        totalErrors += snapshots.length;
      } else {
        totalInserted += snapshots.length;
      }
    }

    for (const u of activityUpdates) {
      await serviceClient
        .from('players')
        .update({ last_wot_activity_at: u.last_battle_at })
        .eq('id', u.id)
        .or(`last_wot_activity_at.is.null,last_wot_activity_at.lt.${u.last_battle_at}`);
    }
  }

  return new Response(
    JSON.stringify({ snapshots: totalInserted, errors: totalErrors, players: players.length }),
    { status: 200, headers },
  );
}
