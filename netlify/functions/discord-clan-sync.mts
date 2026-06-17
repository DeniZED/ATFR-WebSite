import { createHash, timingSafeEqual } from 'node:crypto';
import type { Context } from '@netlify/functions';

const SYNC_SECRET = process.env.DISCORD_SYNC_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.ALLOWED_ORIGINS) {
  console.warn('[discord-clan-sync] ALLOWED_ORIGINS is not set — all cross-origin requests will be rejected.');
}

interface ClanMemberInput {
  account_id?: number;
  account_name?: string;
  role?: string | null;
}

interface ClanSyncPayload {
  guild_id?: string | null;
  clan_id?: number;
  clan_tag?: string | null;
  members?: ClanMemberInput[];
}

interface ClanSyncResult {
  bootstrap: boolean;
  joins: Array<{ account_id: number; account_name: string; role: string | null }>;
  leaves: Array<{ account_id: number; account_name: string; role: string | null }>;
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
    'access-control-allow-methods': 'POST, OPTIONS',
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

function isValidMember(m: unknown): m is Required<ClanMemberInput> {
  if (!m || typeof m !== 'object') return false;
  const member = m as ClanMemberInput;
  return (
    typeof member.account_id === 'number' &&
    Number.isFinite(member.account_id) &&
    typeof member.account_name === 'string' &&
    member.account_name.length > 0
  );
}

function isValidPayload(body: unknown): body is ClanSyncPayload {
  if (!body || typeof body !== 'object') return false;
  const payload = body as ClanSyncPayload;
  return (
    typeof payload.clan_id === 'number' &&
    Number.isFinite(payload.clan_id) &&
    (payload.guild_id == null || typeof payload.guild_id === 'string') &&
    (payload.clan_tag == null || typeof payload.clan_tag === 'string') &&
    Array.isArray(payload.members) &&
    payload.members.every(isValidMember)
  );
}

async function syncClanRoster(payload: ClanSyncPayload): Promise<ClanSyncResult> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role is not configured');
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sync_clan_roster`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      p_guild_id: payload.guild_id ?? null,
      p_clan_id: payload.clan_id,
      p_clan_tag: payload.clan_tag ?? null,
      p_members: payload.members ?? [],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[supabase-rpc] sync_clan_roster failed', res.status, detail);
    throw new Error(`RPC sync_clan_roster failed (${res.status})`);
  }
  return (await res.json()) as ClanSyncResult;
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin);
  }
  if (!(await canRun(req))) {
    return json({ error: 'Forbidden' }, 403, origin);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, origin);
  }

  if (!isValidPayload(body)) {
    return json({ error: 'Invalid clan sync payload' }, 400, origin);
  }

  try {
    const result = await syncClanRoster(body);
    return json(result, 200, origin);
  } catch (err) {
    return json(
      { error: 'Clan roster sync failed', detail: (err as Error).message },
      502,
      origin,
    );
  }
};
