import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { verifyPlayerToken } from './_player-token.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ALLOWED_SKIN_IDS = new Set([
  'default', 'desert', 'winter', 'urban', 'forest',
  'digital', 'arctic', 'atfr', 'chrome', 'prestige',
]);
const ALLOWED_TITLE_IDS = new Set([
  'title-rookie', 'title-scout', 'title-corporal', 'title-sergeant',
  'title-lieutenant', 'title-captain', 'title-commander', 'title-legend',
  'title-master', null,
]);
const ALLOWED_EMBLEM_IDS = new Set([
  'emb-crosshair', 'emb-star', 'emb-bolt', 'emb-diamond', 'emb-compass', null,
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function isValidAvatarConfig(c: unknown): boolean {
  if (typeof c !== 'object' || c === null) return false;
  const cfg = c as Record<string, unknown>;
  if (typeof cfg.skinId !== 'string' || !ALLOWED_SKIN_IDS.has(cfg.skinId)) return false;
  if (cfg.titleId !== null && cfg.titleId !== undefined && (typeof cfg.titleId !== 'string' || !ALLOWED_TITLE_IDS.has(cfg.titleId))) return false;
  if (cfg.emblemId !== null && cfg.emblemId !== undefined && (typeof cfg.emblemId !== 'string' || !ALLOWED_EMBLEM_IDS.has(cfg.emblemId))) return false;
  return true;
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ error: 'Server misconfigured' }, 500);
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // GET: fetch avatar config for a given account_id
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const accountIdRaw = url.searchParams.get('account_id');
    const accountId = accountIdRaw ? Number(accountIdRaw) : null;
    if (!accountId || !Number.isFinite(accountId)) {
      return json({ error: 'Missing account_id' }, 400);
    }
    const { data, error } = await sb
      .from('geoguesser_player_profiles')
      .select('avatar_config')
      .eq('player_account_id', accountId)
      .maybeSingle();
    if (error) return json({ error: 'DB error' }, 500);
    return json({ avatar_config: data?.avatar_config ?? null });
  }

  // POST: upsert avatar config for a verified player
  if (req.method === 'POST') {
    const ct = req.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) return json({ error: 'Content-Type must be application/json' }, 415);

    let body: unknown;
    try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const b = body as Record<string, unknown>;
    const playerToken = typeof b.player_token === 'string' ? b.player_token : null;
    const avatarConfig = b.avatar_config ?? null;
    const nickname = typeof b.nickname === 'string' && b.nickname.length <= 64 ? b.nickname : null;

    if (!playerToken) return json({ error: 'Missing player_token' }, 401);
    if (!isValidAvatarConfig(avatarConfig)) return json({ error: 'Invalid avatar_config' }, 400);

    const accountId = verifyPlayerToken(playerToken);
    if (!accountId) return json({ error: 'Invalid or expired token' }, 401);

    const payload: Record<string, unknown> = { player_account_id: accountId, avatar_config: avatarConfig };
    if (nickname) payload.nickname = nickname;

    const { error } = await sb
      .from('geoguesser_player_profiles')
      .upsert(payload, { onConflict: 'player_account_id' });
    if (error) return json({ error: 'DB error' }, 500);
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, 405);
};
