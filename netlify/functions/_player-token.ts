import { createHmac, timingSafeEqual } from 'node:crypto';

// Signing secret — prefer the dedicated PLAYER_TOKEN_SECRET variable.
// Falls back to SUPABASE_SERVICE_ROLE_KEY only for backwards-compatibility
// with existing deployments; migrate to a dedicated secret as soon as possible
// so that a leaked signing key cannot be used to bypass RLS.
const SECRET = process.env.PLAYER_TOKEN_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SECRET) {
  throw new Error('[_player-token] PLAYER_TOKEN_SECRET is not configured');
}

const TOKEN_TTL_S = 6 * 3600; // 6 h

/** Issue a short-lived HMAC-signed player identity token after WG verification. */
export function issuePlayerToken(accountId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ a: accountId, e: Math.floor(Date.now() / 1000) + TOKEN_TTL_S }),
  ).toString('base64url');
  const sig = createHmac('sha256', SECRET!).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/** Verify a player token. Returns account_id on success, null on failure. */
export function verifyPlayerToken(token: string): number | null {
  if (typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = createHmac('sha256', SECRET!).update(payload).digest('base64url');
  try {
    const eBuf = Buffer.from(expected, 'base64url');
    const sBuf = Buffer.from(sig, 'base64url');
    if (eBuf.length !== sBuf.length || !timingSafeEqual(eBuf, sBuf)) return null;
  } catch {
    return null;
  }

  let data: { a: number; e: number };
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (typeof data.a !== 'number' || typeof data.e !== 'number') return null;
  if (data.e < Math.floor(Date.now() / 1000)) return null; // expired

  return data.a;
}
