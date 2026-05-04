import type { Context } from '@netlify/functions';

// Use a dedicated server-side variable — never the VITE_ prefixed one
// (which belongs to the frontend bundle and carries different trust assumptions).
const WG_APP_ID = process.env.WOT_APPLICATION_ID;
const WG_PROLONGATE = 'https://api.worldoftanks.eu/wot/auth/prolongate/';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const b = body as Record<string, unknown>;
  const accountId =
    typeof b.account_id === 'number'
      ? b.account_id
      : typeof b.account_id === 'string'
        ? parseInt(b.account_id, 10)
        : NaN;
  const accessToken = typeof b.access_token === 'string' ? b.access_token : null;

  if (!Number.isFinite(accountId) || accountId <= 0 || !accessToken || accessToken.length > 512) {
    return json({ error: 'Invalid payload' }, 400);
  }

  if (!WG_APP_ID) {
    console.error('[wg-auth-verify] WOT_APPLICATION_ID not configured');
    return json({ error: 'Server configuration error' }, 500);
  }

  // Call WG prolongate — this both validates the token AND returns the account_id
  // the token actually belongs to, which is the only server-side way to confirm
  // that the (account_id, access_token) pair is genuine and not forged.
  const prolongateBody = new URLSearchParams({
    application_id: WG_APP_ID,
    access_token: accessToken,
  });

  let wgData: Record<string, unknown>;
  try {
    const wgRes = await fetch(WG_PROLONGATE, {
      method: 'POST',
      body: prolongateBody,
      signal: AbortSignal.timeout(8_000),
    });
    if (!wgRes.ok) {
      return json({ error: 'WG API unreachable' }, 502);
    }
    wgData = (await wgRes.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'WG API unreachable' }, 502);
  }

  if (wgData.status !== 'ok') {
    // Token is invalid, expired, or revoked
    return json({ error: 'Token rejected by Wargaming' }, 401);
  }

  const data = wgData.data as Record<string, unknown> | null;
  const realAccountId = typeof data?.account_id === 'number' ? data.account_id : NaN;
  const newExpiresAt = typeof data?.expires_at === 'number' ? data.expires_at : null;
  const newAccessToken = typeof data?.access_token === 'string' ? data.access_token : accessToken;

  if (!Number.isFinite(realAccountId) || realAccountId !== accountId) {
    // Token is valid but belongs to a different account — forgery attempt
    console.warn('[wg-auth-verify] account_id mismatch: claimed', accountId, 'real', realAccountId);
    return json({ error: 'Account ID mismatch' }, 401);
  }

  return json({
    ok: true,
    account_id: realAccountId,
    access_token: newAccessToken,
    expires_at: newExpiresAt,
  });
};
