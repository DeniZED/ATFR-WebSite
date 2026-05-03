import type { Context } from '@netlify/functions';

const DISCORD_API = 'https://discord.com/api/v10';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DEFAULT_GUILD_ID = process.env.DISCORD_GUILD_ID;
const SYNC_SECRET = process.env.DISCORD_SYNC_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
}

interface DiscordGuildMember {
  user?: DiscordUser;
  nick?: string | null;
  roles?: string[];
}

interface DiscordMemberPayload {
  discord_user_id: string;
  username: string;
  display_name: string | null;
  global_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  roles: string[];
  source: 'bot';
}

function json(body: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders(),
      ...extraHeaders,
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

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role is not configured');
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as T;
}

async function fetchAllDiscordMembers(
  guildId: string,
): Promise<DiscordGuildMember[]> {
  if (!BOT_TOKEN) throw new Error('DISCORD_BOT_TOKEN is not configured');

  const members: DiscordGuildMember[] = [];
  let after = '0';

  for (;;) {
    const url = new URL(`${DISCORD_API}/guilds/${guildId}/members`);
    url.searchParams.set('limit', '1000');
    url.searchParams.set('after', after);

    const res = await fetch(url, {
      headers: { authorization: `Bot ${BOT_TOKEN}` },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Discord members fetch failed (${res.status}) ${detail}`);
    }

    const batch = (await res.json()) as DiscordGuildMember[];
    members.push(...batch);
    if (batch.length < 1000) break;

    const lastUserId = batch.at(-1)?.user?.id;
    if (!lastUserId || lastUserId === after) break;
    after = lastUserId;
  }

  return members;
}

function mapMember(member: DiscordGuildMember): DiscordMemberPayload | null {
  const user = member.user;
  if (!user?.id || !user.username) return null;
  return {
    discord_user_id: user.id,
    username: user.username,
    display_name: member.nick ?? user.global_name ?? user.username,
    global_name: user.global_name ?? null,
    nickname: member.nick ?? null,
    avatar_url: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : null,
    roles: member.roles ?? [],
    source: 'bot',
  };
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

  const url = new URL(req.url);
  const guildId = url.searchParams.get('guild_id') || DEFAULT_GUILD_ID;
  if (!guildId) {
    return json({ error: 'DISCORD_GUILD_ID is not configured' }, 500);
  }

  try {
    const members = await fetchAllDiscordMembers(guildId);
    const payload = members.map(mapMember).filter(Boolean);
    const synced = await rpc<number>('upsert_discord_guild_members', {
      p_guild_id: guildId,
      p_members: payload,
    });
    const linked = await rpc<number>('auto_link_discord_members', {
      p_guild_id: guildId,
    });
    const statuses = await rpc<number>('recompute_player_hr_statuses', {});

    return json({
      guildId,
      fetched: members.length,
      synced,
      linked,
      statuses,
    });
  } catch (err) {
    return json(
      {
        error: 'Discord full sync failed',
        detail: (err as Error).message,
      },
      502,
    );
  }
};
