import type { Context } from '@netlify/functions';

const SYNC_SECRET = process.env.DISCORD_SYNC_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface VoiceEventPayload {
  guild_id?: string | null;
  discord_user_id?: string | null;
  channel_id?: string | null;
  channel_name?: string | null;
  event?: 'join' | 'leave' | 'move';
  occurred_at?: string | null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders(),
    },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers':
      'authorization, content-type, x-sync-secret',
  };
}

async function canRun(req: Request): Promise<boolean> {
  const url = new URL(req.url);
  const providedSecret =
    req.headers.get('x-sync-secret') || url.searchParams.get('secret');
  if (SYNC_SECRET && providedSecret === SYNC_SECRET) return true;

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

async function recordVoiceEvent(payload: VoiceEventPayload): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role is not configured');
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/record_discord_voice_event`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      p_guild_id: payload.guild_id ?? null,
      p_discord_user_id: payload.discord_user_id,
      p_channel_id: payload.channel_id ?? null,
      p_channel_name: payload.channel_name ?? null,
      p_event: payload.event ?? 'join',
      p_occurred_at: payload.occurred_at ?? new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as string | null;
}

function isValidPayload(body: unknown): body is VoiceEventPayload {
  if (!body || typeof body !== 'object') return false;
  const payload = body as VoiceEventPayload;
  return (
    typeof payload.discord_user_id === 'string' &&
    payload.discord_user_id.length > 0 &&
    (!payload.event ||
      payload.event === 'join' ||
      payload.event === 'leave' ||
      payload.event === 'move')
  );
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (!(await canRun(req))) {
    return json({ error: 'Forbidden' }, 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (Array.isArray(body)) {
    const events = body.filter(isValidPayload);
    if (events.length !== body.length) {
      return json({ error: 'Invalid voice event payload' }, 400);
    }
    try {
      const ids = [];
      for (const event of events) ids.push(await recordVoiceEvent(event));
      return json({ recorded: ids.length, sessionIds: ids });
    } catch (err) {
      return json(
        { error: 'Voice event recording failed', detail: (err as Error).message },
        502,
      );
    }
  }

  if (!isValidPayload(body)) {
    return json({ error: 'Invalid voice event payload' }, 400);
  }

  try {
    const sessionId = await recordVoiceEvent(body);
    return json({ recorded: 1, sessionId });
  } catch (err) {
    return json(
      { error: 'Voice event recording failed', detail: (err as Error).message },
      502,
    );
  }
};
