import { createHash, timingSafeEqual } from 'node:crypto';
import type { Context } from '@netlify/functions';

const SYNC_SECRET = process.env.DISCORD_SYNC_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.ALLOWED_ORIGINS) {
  console.warn('[discord-clan-movements] ALLOWED_ORIGINS is not set — all cross-origin requests will be rejected.');
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
    'access-control-allow-methods': 'GET, OPTIONS',
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

async function getMovements(guildId: string, clanId: number | null, limit: number): Promise<unknown[]> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role is not configured');
  }
  const qs = new URLSearchParams({
    guild_id: `eq.${guildId}`,
    select: '*',
    order: 'occurred_at.desc',
    limit: String(limit),
  });
  if (clanId !== null) qs.set('clan_id', `eq.${clanId}`);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/clan_member_movements?${qs}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      accept: 'application/json',
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Supabase GET clan_member_movements failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as unknown[];
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405, origin);
  }
  if (!(await canRun(req))) {
    return json({ error: 'Forbidden' }, 403, origin);
  }

  const url = new URL(req.url);
  const guildId = url.searchParams.get('guild_id');
  if (!guildId) return json({ error: 'guild_id is required' }, 400, origin);

  const clanIdParam = url.searchParams.get('clan_id');
  const clanId = clanIdParam !== null ? Number(clanIdParam) : null;
  if (clanIdParam !== null && !Number.isFinite(clanId)) {
    return json({ error: 'clan_id must be a number' }, 400, origin);
  }

  const limitParam = url.searchParams.get('limit');
  const limit = limitParam !== null ? Number(limitParam) : 20;
  if (!Number.isFinite(limit) || limit <= 0 || limit > 200) {
    return json({ error: 'limit must be between 1 and 200' }, 400, origin);
  }

  try {
    const movements = await getMovements(guildId, clanId, Math.floor(limit));
    return json({ movements }, 200, origin);
  } catch (err) {
    return json({ error: 'Failed to load movements', detail: (err as Error).message }, 502, origin);
  }
};
