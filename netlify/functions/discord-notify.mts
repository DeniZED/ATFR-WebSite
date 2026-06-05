import type { Context } from '@netlify/functions';

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (ALLOWED_ORIGINS.length === 0) {
  console.warn('[discord-notify] ALLOWED_ORIGINS is not set — all cross-origin requests will be rejected.');
}

interface ApplicationPayload {
  playerName: string;
  discordTag: string;
  targetClan: 'ATFR' | 'A-T-O';
  availability: string;
  motivation: string;
  previousClans?: string | null;
  wn8?: number | null;
  winRate?: number | null;
  battles?: number | null;
  accountId?: number | null;
}

function isFiniteNumberOrNullish(v: unknown): boolean {
  return v == null || (typeof v === 'number' && Number.isFinite(v));
}

function isValid(body: unknown): body is ApplicationPayload {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.playerName === 'string' &&
    b.playerName.length >= 3 &&
    b.playerName.length <= 40 &&
    typeof b.discordTag === 'string' &&
    b.discordTag.length >= 2 &&
    b.discordTag.length <= 64 &&
    (b.targetClan === 'ATFR' || b.targetClan === 'A-T-O') &&
    typeof b.availability === 'string' &&
    b.availability.length >= 1 &&
    b.availability.length <= 500 &&
    typeof b.motivation === 'string' &&
    b.motivation.length >= 30 &&
    b.motivation.length <= 2000 &&
    (b.previousClans == null ||
      (typeof b.previousClans === 'string' && b.previousClans.length <= 500)) &&
    isFiniteNumberOrNullish(b.wn8) &&
    isFiniteNumberOrNullish(b.winRate) &&
    isFiniteNumberOrNullish(b.battles) &&
    isFiniteNumberOrNullish(b.accountId)
  );
}

function cors(origin: string | null): Record<string, string> {
  const allowed = origin != null && ALLOWED_ORIGINS.includes(origin);
  return {
    'access-control-allow-origin': allowed ? origin : 'null',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    vary: 'origin',
  };
}

export default async (req: Request, _context: Context): Promise<Response> => {
  const origin = req.headers.get('origin');
  const headers = cors(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers });
  }
  if (!WEBHOOK_URL) {
    return new Response(
      JSON.stringify({ error: 'Webhook not configured' }),
      {
        status: 500,
        headers: { ...headers, 'content-type': 'application/json' },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers });
  }
  if (!isValid(body)) {
    return new Response('Invalid payload', { status: 400, headers });
  }

  const app = body;
  const fields = [
    { name: 'Pseudo WoT', value: app.playerName, inline: true },
    { name: 'Discord', value: app.discordTag, inline: true },
    { name: 'Clan visé', value: app.targetClan, inline: true },
    { name: 'Disponibilités', value: app.availability },
    {
      name: 'Motivation',
      value:
        app.motivation.length > 900
          ? app.motivation.slice(0, 900) + '…'
          : app.motivation,
    },
  ];
  if (app.previousClans) {
    fields.push({ name: 'Clans précédents', value: app.previousClans });
  }
  const statLine: string[] = [];
  if (app.wn8 != null) statLine.push(`WN8 ${Math.round(app.wn8)}`);
  if (app.winRate != null) statLine.push(`WR ${app.winRate.toFixed(2)}%`);
  if (app.battles != null) statLine.push(`${app.battles} batailles`);
  if (statLine.length > 0) {
    fields.push({ name: 'Stats', value: statLine.join(' · '), inline: false });
  }

  const webhookBody = JSON.stringify({
    username: 'ATFR Recrutement',
    embeds: [
      {
        title: `Nouvelle candidature — ${app.targetClan}`,
        color: 0xe8b043,
        timestamp: new Date().toISOString(),
        fields,
        footer: { text: app.accountId ? `WG ID ${app.accountId}` : '—' },
      },
    ],
  });

  let discordRes: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
    try {
      discordRes = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: webhookBody,
      });
      if (discordRes.ok) break;
    } catch (err) {
      console.error(`[discord-notify] attempt ${attempt + 1} threw:`, err);
    }
  }

  if (!discordRes?.ok) {
    const detail = discordRes ? await discordRes.text().catch(() => '') : 'network error';
    console.error('[discord-notify] webhook failed after retries:', discordRes?.status, detail);
    return new Response(
      JSON.stringify({ error: 'Notification failed, please try again.' }),
      {
        status: 502,
        headers: { ...headers, 'content-type': 'application/json' },
      },
    );
  }

  return new Response(null, { status: 204, headers });
};
