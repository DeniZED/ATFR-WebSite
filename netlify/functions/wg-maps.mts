import type { Context } from '@netlify/functions';

const APP_ID =
  process.env.WOT_APPLICATION_ID || process.env.VITE_WOT_APPLICATION_ID;
const WG_BASE = 'https://api.worldoftanks.eu/wot';

interface WgArena {
  arena_id: string;
  name_i18n: string;
  description?: string | null;
  // The minimap field is exposed as a relative path in some WG envs.
  // We keep both for safety; the client can pick the absolute URL.
  minimap?: string | null;
}

export interface WgMapPayload {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
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
      fields: 'arena_id,name_i18n,description,minimap',
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
      .filter((a) => a.arena_id && a.name_i18n)
      .map((a) => ({
        id: a.arena_id,
        name: a.name_i18n,
        description: a.description ?? null,
        // WG returns a relative path; we leave it raw and let the client
        // pick a sensible CDN base. Most clients render the field as-is
        // since it's also exposed by other WG endpoints.
        image_url: a.minimap ?? '',
      }))
      .filter((m) => m.image_url);

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
