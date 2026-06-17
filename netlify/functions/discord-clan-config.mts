import { createHash, timingSafeEqual } from 'node:crypto';
import type { Context } from '@netlify/functions';

const SYNC_SECRET = process.env.DISCORD_SYNC_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.ALLOWED_ORIGINS) {
  console.warn('[discord-clan-config] ALLOWED_ORIGINS is not set — all cross-origin requests will be rejected.');
}

type ConfigAction = 'add_clan' | 'remove_clan' | 'set_channel';

interface ConfigRequestPayload {
  guild_id?: string;
  action?: ConfigAction;
  clan_id?: number;
  clan_tag?: string | null;
  clan_name?: string | null;
  channel_id?: string | null;
  updated_by?: string | null;
}

function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowOrigin =
    origin != null && allowed.length > 0 && allowed.includes(origin) ? origin : 'null';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type, x-sync-secret',
    vary: 'origin',
  };
}

function secretsMatch(provided: string, expected: string): boolean {
  const h = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(provided), h(expected));
}

async function canRun(req: Request): Promise<boolean> {
  const providedSecret = req.headers.get('x-sync-secret');
  if (SYNC_SECRET && providedSecret !== null && secretsMatch(providedSecret, SYNC_SECRET)) return true;

  const auth = req.headers.get('authorization');
  if (!auth || !SUPABASE_URL || !SUPABASE_ANON_KEY) return false;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      authorization: auth,
      'content-type': 'application/json',
    },
    body: '{}',
  });
  if (!res.ok) return false;
  return (await res.json().catch(() => false)) === true;
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role is not configured');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(`[supabase-rpc] ${name} failed (${res.status}):`, detail);
    throw new Error(`RPC ${name} failed (${res.status})`);
  }
  return (await res.json()) as T;
}

async function getConfig(guildId: string): Promise<unknown> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role is not configured');
  }
  const qs = new URLSearchParams({ guild_id: `eq.${guildId}`, select: '*' });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/discord_bot_guild_configs?${qs}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      accept: 'application/json',
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Supabase GET discord_bot_guild_configs failed (${res.status}): ${detail}`);
  }
  const rows = (await res.json()) as unknown[];
  return rows[0] ?? null;
}

function isValidAction(action: unknown): action is ConfigAction {
  return action === 'add_clan' || action === 'remove_clan' || action === 'set_channel';
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (!(await canRun(req))) {
    return json({ error: 'Forbidden' }, 403, origin);
  }

  if (req.method === 'GET') {
    const guildId = new URL(req.url).searchParams.get('guild_id');
    if (!guildId) return json({ error: 'guild_id is required' }, 400, origin);
    try {
      const cfg = await getConfig(guildId);
      return json({ config: cfg }, 200, origin);
    } catch (err) {
      return json({ error: 'Failed to load config', detail: (err as Error).message }, 502, origin);
    }
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, origin);
  }

  const payload = body as ConfigRequestPayload;
  if (!payload?.guild_id || typeof payload.guild_id !== 'string') {
    return json({ error: 'guild_id is required' }, 400, origin);
  }
  if (!isValidAction(payload.action)) {
    return json({ error: 'Invalid action' }, 400, origin);
  }

  try {
    let result: unknown;
    if (payload.action === 'add_clan') {
      if (typeof payload.clan_id !== 'number' || !Number.isFinite(payload.clan_id)) {
        return json({ error: 'clan_id is required' }, 400, origin);
      }
      result = await rpc('add_tracked_clan', {
        p_guild_id: payload.guild_id,
        p_clan_id: payload.clan_id,
        p_clan_tag: payload.clan_tag ?? null,
        p_clan_name: payload.clan_name ?? null,
        p_updated_by: payload.updated_by ?? null,
      });
    } else if (payload.action === 'remove_clan') {
      if (typeof payload.clan_id !== 'number' || !Number.isFinite(payload.clan_id)) {
        return json({ error: 'clan_id is required' }, 400, origin);
      }
      result = await rpc('remove_tracked_clan', {
        p_guild_id: payload.guild_id,
        p_clan_id: payload.clan_id,
        p_updated_by: payload.updated_by ?? null,
      });
    } else {
      result = await rpc('upsert_discord_bot_guild_config', {
        p_guild_id: payload.guild_id,
        p_clan_notify_channel_id: payload.channel_id ?? null,
        p_tracked_clans: null,
        p_scan_interval_minutes: null,
        p_updated_by: payload.updated_by ?? null,
      });
    }
    return json({ config: result }, 200, origin);
  } catch (err) {
    return json({ error: 'Config update failed', detail: (err as Error).message }, 502, origin);
  }
};
