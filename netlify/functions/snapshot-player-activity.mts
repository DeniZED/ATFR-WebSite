import type { Config } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_ID = process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;
const WG_BASE = 'https://api.worldoftanks.eu/wot';
const BATCH_SIZE = 100; // WoT /account/info/ max per request

interface WgAccountInfo {
  account_id: number;
  nickname: string;
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

async function wgAccountInfo(
  accountIds: number[],
): Promise<Record<string, WgAccountInfo | null>> {
  if (!APP_ID) throw new Error('[snapshot] WOT_APPLICATION_ID not configured');
  const qs = new URLSearchParams({
    application_id: APP_ID,
    account_id: accountIds.join(','),
    fields: 'account_id,nickname,last_battle_time,statistics.all.battles',
  });
  const res = await fetch(`${WG_BASE}/account/info/?${qs}`);
  if (!res.ok) throw new Error(`[snapshot] WoT /account/info/ ${res.status}`);
  const json = (await res.json()) as {
    status: string;
    error?: { message: string };
    data: Record<string, WgAccountInfo | null>;
  };
  if (json.status !== 'ok') {
    throw new Error(`[snapshot] WoT error: ${json.error?.message ?? 'unknown'}`);
  }
  return json.data;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function handler(): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[snapshot] Supabase service role not configured');
    return;
  }
  if (!APP_ID) {
    console.error('[snapshot] WOT_APPLICATION_ID not configured');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const today = isoDate(new Date());
  const yesterday = isoDate(new Date(Date.now() - 86_400_000));

  // Load all tracked players with a WoT account (non-former preferred but include all)
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id, account_id, nickname')
    .not('account_id', 'is', null)
    .neq('status', 'former');

  if (playersError) {
    console.error('[snapshot] failed to load players:', playersError.message);
    return;
  }
  if (!players || players.length === 0) {
    console.log('[snapshot] no players to snapshot');
    return;
  }

  // Load yesterday's battles count to compute battles_delta
  const { data: prevSnapshots } = await supabase
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

    let wgData: Record<string, WgAccountInfo | null>;
    try {
      wgData = await wgAccountInfo(accountIds);
    } catch (err) {
      console.error('[snapshot] WoT batch failed:', err);
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
        info.last_battle_time && info.last_battle_time > 0
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
        source: 'scheduled',
        meta: {},
      });

      if (lastBattleAt) {
        activityUpdates.push({ id: player.id as string, last_battle_at: lastBattleAt });
      }
    }

    if (snapshots.length > 0) {
      const { error: upsertError } = await supabase
        .from('player_activity_snapshots')
        .upsert(snapshots, { onConflict: 'player_id,snapshot_date' });

      if (upsertError) {
        console.error('[snapshot] upsert failed:', upsertError.message);
        totalErrors += snapshots.length;
      } else {
        totalInserted += snapshots.length;
      }
    }

    // Update players.last_wot_activity_at
    for (const u of activityUpdates) {
      await supabase
        .from('players')
        .update({ last_wot_activity_at: u.last_battle_at })
        .eq('id', u.id)
        .or(`last_wot_activity_at.is.null,last_wot_activity_at.lt.${u.last_battle_at}`);
    }
  }

  console.log(
    `[snapshot] done — ${totalInserted} snapshot(s) inserted, ${totalErrors} error(s)`,
  );
}

// Every day at 06:00 UTC
export const config: Config = {
  schedule: '0 6 * * *',
};
