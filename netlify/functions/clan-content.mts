import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { verifyPlayerToken } from './_player-token.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WG_APP_ID = process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;

const SLUG_RE = /^[a-z0-9-]{1,64}$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Sert le contenu réservé d'une page clan (P0-2). Le contenu (doctrine,
 * stratégies, cartes, rôles, fiches chars, liens) n'est plus compilé dans
 * le bundle JS public : il vit dans clan_page_content (RLS sans policy
 * anon) et n'est renvoyé qu'après vérification côté serveur :
 *   1. player_token HMAC valide (joueur connecté via WG) ;
 *   2. clan_id réel du joueur (API WG, jamais déclaré par le client)
 *      présent dans clan_pages.allowed_clans pour ce slug.
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
  const pageSlug = typeof b.page_slug === 'string' && SLUG_RE.test(b.page_slug) ? b.page_slug : null;
  const playerToken =
    typeof b.player_token === 'string' && b.player_token.length > 0 && b.player_token.length < 512
      ? b.player_token
      : null;

  if (!pageSlug) return json({ error: 'Missing or invalid page_slug' }, 400);
  if (!playerToken) return json({ error: 'Authentication required' }, 401);

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !WG_APP_ID) {
    console.error('[clan-content] missing configuration (Supabase service role / WOT_APPLICATION_ID)');
    return json({ error: 'Server configuration error' }, 500);
  }

  const accountId = verifyPlayerToken(playerToken);
  if (accountId === null) {
    return json({ error: 'Invalid or expired player token' }, 401);
  }

  // Clan réel du joueur — résolu côté serveur via l'API WG, jamais accepté
  // du client.
  let playerClanId: number | null = null;
  try {
    const qs = new URLSearchParams({
      application_id: WG_APP_ID,
      account_id: String(accountId),
      fields: 'clan.clan_id,clan.tag',
    });
    const res = await fetch(`https://api.worldoftanks.eu/wot/clans/accountinfo/?${qs}`, {
      signal: AbortSignal.timeout(8000),
    });
    const wg = (await res.json()) as {
      status?: string;
      data?: Record<string, { clan: { clan_id: number; tag: string } | null } | null>;
    };
    if (!res.ok || wg.status !== 'ok') {
      console.error('[clan-content] WG API error:', res.status, wg.status);
      return json({ error: 'Clan verification unavailable, retry later' }, 502);
    }
    playerClanId = wg.data?.[String(accountId)]?.clan?.clan_id ?? null;
  } catch (e) {
    console.error('[clan-content] WG API fetch failed:', e instanceof Error ? e.message : e);
    return json({ error: 'Clan verification unavailable, retry later' }, 502);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: page, error: pageError } = await supabase
    .from('clan_pages')
    .select('slug, allowed_clans')
    .eq('slug', pageSlug)
    .maybeSingle();

  if (pageError) {
    console.error('[clan-content] clan_pages fetch error:', pageError.message);
    return json({ error: 'Failed to load page' }, 500);
  }
  if (!page) return json({ error: 'Page not found' }, 404);

  const allowedClans = (page.allowed_clans ?? []) as Array<{ clan_id: number | string }>;
  const allowed =
    playerClanId !== null &&
    allowedClans.some((c) => String(c.clan_id) === String(playerClanId));

  if (!allowed) return json({ error: 'Clan not allowed for this page' }, 403);

  const { data: rows, error: contentError } = await supabase
    .from('clan_page_content')
    .select('content_key, payload, updated_at')
    .eq('page_slug', pageSlug);

  if (contentError) {
    console.error('[clan-content] content fetch error:', contentError.message);
    return json({ error: 'Failed to load content' }, 500);
  }

  const contents: Record<string, unknown> = {};
  for (const row of rows ?? []) {
    contents[row.content_key] = row.payload;
  }

  return json({ page_slug: pageSlug, contents });
};
