import type { Context } from '@netlify/functions';

const APP_ID =
  process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;
const WG_BASE = 'https://api.worldoftanks.eu/wot';

// Fallback CDN pour reconstruire l'URL d'une minimap quand WG ne renvoie
// pas de champ `minimap` exploitable (ou renvoie un chemin relatif).
const WG_CDN_BASE =
  'https://glossary-eu-static.gcdn.co/icons/wot/current/maps/minimap_normal';

interface WgArena {
  arena_id: string;
  name_i18n?: string | null;
  description?: string | null;
  /** Champ historiquement renvoyé par WG : URL absolue ou chemin relatif. */
  minimap?: string | null;
}

interface WgError {
  field?: string;
  message?: string;
  code?: number;
  value?: string;
}

interface WgArenasResponse {
  status: string;
  error?: WgError;
  data?: Record<string, WgArena>;
}

export interface WgMapPayload {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  size_m: number;
}

function resolveMinimapUrl(
  raw: string | null | undefined,
  arenaId: string,
): string {
  if (raw) {
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;
    if (raw.startsWith('/')) return `https://glossary-eu-static.gcdn.co${raw}`;
  }
  return `${WG_CDN_BASE}/${arenaId}.png`;
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (!APP_ID) {
    return new Response(
      JSON.stringify({ error: 'WOT_APPLICATION_ID missing' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  try {
    // On reste sur les champs publics garantis par /encyclopedia/arenas/.
    // (`area_size` n'est pas exposé ici ; les maps WoT font ~1000 m de
    // côté par défaut, l'éditeur peut surcharger `size_m` map par map.)
    const qs = new URLSearchParams({
      application_id: APP_ID,
      fields: 'arena_id,name_i18n,description,minimap',
      language: 'fr',
    });
    const url = `${WG_BASE}/encyclopedia/arenas/?${qs}`;
    const res = await fetch(url);
    const text = await res.text();
    if (!res.ok) {
      return new Response(
        JSON.stringify({
          error: `WG HTTP ${res.status}`,
          body: text.slice(0, 400),
        }),
        { status: 502, headers: { 'content-type': 'application/json' } },
      );
    }

    let json: WgArenasResponse;
    try {
      json = JSON.parse(text) as WgArenasResponse;
    } catch {
      return new Response(
        JSON.stringify({ error: 'WG payload not JSON', body: text.slice(0, 400) }),
        { status: 502, headers: { 'content-type': 'application/json' } },
      );
    }

    if (json.status !== 'ok') {
      return new Response(
        JSON.stringify({
          error: 'WG error',
          wg: json.error ?? null,
        }),
        { status: 502, headers: { 'content-type': 'application/json' } },
      );
    }

    const maps: WgMapPayload[] = Object.values(json.data ?? {})
      .filter((a) => a.arena_id)
      .map((a) => ({
        id: a.arena_id,
        name: a.name_i18n?.trim() || a.arena_id,
        description: a.description?.trim() || null,
        image_url: resolveMinimapUrl(a.minimap, a.arena_id),
        size_m: 1000,
      }));

    return new Response(JSON.stringify({ maps }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=21600, s-maxage=86400',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }
};
