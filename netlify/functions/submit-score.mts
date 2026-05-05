import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { verifyPlayerToken } from './_player-token.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Regex for safe module_slug / submode identifiers.
const SLUG_RE = /^[a-z0-9_-]{1,64}$/;
// UUIDv4 pattern for player_anon_id.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Proxy endpoint for score submission.
 *
 * Clients that completed WG login send a short-lived `player_token` (issued by
 * wg-auth-verify).  The token is verified server-side with an HMAC — the backend
 * is the only party that can produce a valid token, so `is_verified` / the real
 * `player_account_id` can never be forged by a client.
 *
 * Unauthenticated clients omit `player_token` and get is_verified=false.
 */
export default async (req: Request, _ctx: Context): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const ct = req.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return json({ error: 'Content-Type must be application/json' }, 415);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const b = body as Record<string, unknown>;

  const moduleSlug =
    typeof b.module_slug === 'string' && SLUG_RE.test(b.module_slug)
      ? b.module_slug
      : null;
  const submode =
    typeof b.submode === 'string' && SLUG_RE.test(b.submode)
      ? b.submode
      : 'default';
  const score = Number.isFinite(b.score as number) ? (b.score as number) : null;
  const maxScore = Number.isFinite(b.max_score as number) ? (b.max_score as number) : null;
  const playerAnonId =
    typeof b.player_anon_id === 'string' && UUID_RE.test(b.player_anon_id)
      ? b.player_anon_id
      : null;
  const playerNickname =
    typeof b.player_nickname === 'string'
      ? b.player_nickname.trim().slice(0, 32)
      : null;
  const meta =
    typeof b.meta === 'object' && b.meta !== null && !Array.isArray(b.meta)
      ? b.meta
      : {};
  const playerToken =
    typeof b.player_token === 'string' && b.player_token.length < 512
      ? b.player_token
      : null;

  if (!moduleSlug || score === null || maxScore === null || !playerAnonId || !playerNickname) {
    return json({ error: 'Missing or invalid required fields' }, 400);
  }
  if (score < 0 || score > maxScore || maxScore <= 0) {
    return json({ error: 'Invalid score range' }, 400);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[submit-score] Supabase service role not configured');
    return json({ error: 'Server configuration error' }, 500);
  }

  // Verify player token — sole path to is_verified=true.
  let verifiedAccountId: number | null = null;
  if (playerToken !== null) {
    verifiedAccountId = verifyPlayerToken(playerToken);
    if (verifiedAccountId === null) {
      return json({ error: 'Invalid or expired player token' }, 401);
    }
  }

  // Service-role client bypasses RLS — the function itself is the trust boundary.
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from('module_scores').insert({
    module_slug: moduleSlug,
    submode,
    score,
    max_score: maxScore,
    player_anon_id: playerAnonId,
    player_nickname: playerNickname,
    player_account_id: verifiedAccountId,
    is_verified: verifiedAccountId !== null,
    meta,
  });

  if (error) {
    console.error('[submit-score] DB insert error:', error.message);
    return json({ error: 'Failed to save score' }, 500);
  }

  return json({ ok: true });
};
