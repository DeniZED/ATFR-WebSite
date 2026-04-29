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
  /** Côté de la map en mètres (souvent renvoyé sous forme "1000x1000"). */
  area_size?: string | null;
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

function parseAreaSize(value: string | null | undefined): number {
  if (!value) return 1000;
  const m = /(\d+)\s*[x×*]\s*(\d+)/i.exec(value);
  if (!m) return 1000;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return 1000;
  // Maps WoT carrées ; on prend le max au cas où.
  return Math.max(w, h);
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
    const qs = new URLSearchParams({
      application_id: APP_ID,
      fields: 'arena_id,name_i18n,description,minimap,area_size',
      language: 'fr',
    });
    const res = await fetch(`${WG_BASE}/encyclopedia/arenas/?${qs}`);
    if (!res.ok) throw new Error(`WG /encyclopedia/arenas/ ${res.status}`);
    const json = (await res.json()) as {
      status: string;
      error?: { message: string };
      data: Record<string, WgArena>;
    };
    if (json.status !== 'ok') {
      throw new Error(`WG error: ${json.error?.message ?? 'unknown'}`);
    }

    const maps: WgMapPayload[] = Object.values(json.data ?? {})
      .filter((a) => a.arena_id)
      .map((a) => ({
        id: a.arena_id,
        name: a.name_i18n?.trim() || a.arena_id,
        description: a.description?.trim() || null,
        image_url: resolveMinimapUrl(a.minimap, a.arena_id),
        size_m: parseAreaSize(a.area_size),
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
