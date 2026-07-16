import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      // Agrégats peu volatils : on autorise un cache CDN court avec
      // revalidation en tâche de fond.
      'cache-control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}

interface CommunityStatsRow {
  total_members: number;
  atfr_members: number;
  ato_members: number;
  online_total: number;
  atfr_online: number;
  ato_online: number;
  voice_seconds_30d: number;
  voice_members_30d: number;
}

export interface DiscordCommunityStats extends CommunityStatsRow {
  computedAt: string;
}

/**
 * Agrégats publics de la communauté Discord pour la home (nombre de
 * membres serveur, membres ATFR / A-T-O par rôle, temps vocal sur 30 jours
 * glissants). Les tables source (discord_guild_members,
 * discord_voice_sessions) sont en RLS admin : on passe donc par le service
 * role + une fonction SECURITY DEFINER qui ne renvoie que des compteurs.
 *
 * La configuration (guild id + IDs des rôles de clan) est lue en base
 * (site_content), jamais acceptée du client, pour éviter l'énumération de
 * compteurs par rôle arbitraire.
 */
export default async (_req: Request, _ctx: Context): Promise<Response> => {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[discord-community] missing Supabase service role configuration');
    return json({ error: 'Server configuration error' }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: cfgRows, error: cfgError } = await supabase
    .from('site_content')
    .select('key, value')
    .in('key', ['discord_server_id', 'discord_role_atfr', 'discord_role_ato']);

  if (cfgError) {
    console.error('[discord-community] config fetch error:', cfgError.message);
    return json({ error: 'Failed to load configuration' }, 500);
  }

  const cfg = new Map((cfgRows ?? []).map((r) => [r.key, r.value]));
  const guildId = cfg.get('discord_server_id')?.trim() || null;
  const atfrRole = cfg.get('discord_role_atfr')?.trim() || null;
  const atoRole = cfg.get('discord_role_ato')?.trim() || null;

  const { data, error } = await supabase.rpc('discord_community_stats', {
    p_guild_id: guildId,
    p_atfr_role: atfrRole,
    p_ato_role: atoRole,
  });

  if (error) {
    console.error('[discord-community] rpc error:', error.message);
    return json({ error: 'Failed to load community stats' }, 500);
  }

  // La fonction renvoie une table à une seule ligne.
  const row = (Array.isArray(data) ? data[0] : data) as CommunityStatsRow | undefined;
  if (!row) {
    return json({ error: 'No data' }, 404);
  }

  const payload: DiscordCommunityStats = {
    total_members: Number(row.total_members ?? 0),
    atfr_members: Number(row.atfr_members ?? 0),
    ato_members: Number(row.ato_members ?? 0),
    online_total: Number(row.online_total ?? 0),
    atfr_online: Number(row.atfr_online ?? 0),
    ato_online: Number(row.ato_online ?? 0),
    voice_seconds_30d: Number(row.voice_seconds_30d ?? 0),
    voice_members_30d: Number(row.voice_members_30d ?? 0),
    computedAt: new Date().toISOString(),
  };

  return json(payload);
};
