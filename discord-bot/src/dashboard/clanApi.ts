import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Client } from 'discord.js';
import { config } from '../config.js';
import {
  getGuildConfig,
  refreshGuildConfig,
  addTrackedClan,
  removeTrackedClan,
  setNotifyChannel,
  setScanInterval,
} from '../guildConfig.js';
import { getRecentMovements } from '../supabaseSync.js';
import { resolveClanInput } from '../clan/wgClient.js';
import { bulkAddTrackedClans } from '../clan/bulkAdd.js';
import { runGuildScan } from '../scheduler.js';
import { error as logError } from '../logger.js';

function sendJson(res: ServerResponse, body: unknown, status = 200): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function resolveGuildId(client: Client): string | null {
  return config.discord.guildId ?? client.guilds.cache.first()?.id ?? null;
}

function textChannelOptions(client: Client, guildId: string): Array<{ id: string; name: string }> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return [];
  return guild.channels.cache
    .filter((c) => c.isTextBased() && !c.isThread())
    .map((c) => ({ id: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Gère les routes /api/clan/*. Retourne true si la requête a été traitée. */
export async function handleClanApi(
  req: IncomingMessage,
  res: ServerResponse,
  client: Client,
  url: string,
): Promise<boolean> {
  if (!url.startsWith('/api/clan/')) return false;

  const guildId = resolveGuildId(client);
  if (!guildId) {
    sendJson(res, { error: 'Aucun serveur Discord disponible (bot pas encore connecté ?).' }, 503);
    return true;
  }

  try {
    if (url === '/api/clan/config' && req.method === 'GET') {
      const cfg = await refreshGuildConfig(guildId);
      sendJson(res, { guildId, config: cfg, channels: textChannelOptions(client, guildId) });
      return true;
    }

    if (url.startsWith('/api/clan/movements') && req.method === 'GET') {
      const params = new URL(url, 'http://localhost').searchParams;
      const limit = Math.min(Number(params.get('limit') ?? '25') || 25, 100);
      const clanIdParam = params.get('clan_id');
      const clanId = clanIdParam ? Number(clanIdParam) : undefined;
      const movements = await getRecentMovements(guildId, limit, clanId);
      sendJson(res, { movements });
      return true;
    }

    if (url === '/api/clan/channel' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const channelId = typeof body.channel_id === 'string' ? body.channel_id : null;
      const cfg = await setNotifyChannel(guildId, channelId, 'dashboard');
      sendJson(res, { config: cfg });
      return true;
    }

    if (url === '/api/clan/interval' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const minutes = Number(body.minutes);
      if (!Number.isFinite(minutes) || minutes < 5 || minutes > 1440) {
        sendJson(res, { error: "L'intervalle doit être compris entre 5 et 1440 minutes." }, 400);
        return true;
      }
      const cfg = await setScanInterval(guildId, minutes, 'dashboard');
      sendJson(res, { config: cfg });
      return true;
    }

    if (url === '/api/clan/add' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const input = typeof body.clan === 'string' ? body.clan.trim() : '';
      if (!input) {
        sendJson(res, { error: 'Tag ou ID de clan requis.' }, 400);
        return true;
      }
      const resolved = await resolveClanInput(input);
      if (!resolved) {
        sendJson(res, { error: `Clan introuvable pour "${input}".` }, 404);
        return true;
      }
      const cfg = await addTrackedClan(guildId, resolved.clanId, resolved.tag, resolved.name, 'dashboard');
      sendJson(res, { config: cfg, resolved });
      return true;
    }

    if (url === '/api/clan/bulk-add' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const raw = typeof body.clans === 'string' ? body.clans : '';
      const entries = raw.split(/[\s,;]+/).filter(Boolean);
      if (entries.length === 0) {
        sendJson(res, { error: 'Aucun clan à ajouter.' }, 400);
        return true;
      }
      const results = await bulkAddTrackedClans(guildId, entries, 'dashboard');
      const cfg = await refreshGuildConfig(guildId);
      sendJson(res, { results, config: cfg });
      return true;
    }

    if (url === '/api/clan/remove' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const clanId = Number(body.clan_id);
      if (!Number.isFinite(clanId)) {
        sendJson(res, { error: 'clan_id requis.' }, 400);
        return true;
      }
      const cfg = await removeTrackedClan(guildId, clanId, 'dashboard');
      sendJson(res, { config: cfg });
      return true;
    }

    if (url === '/api/clan/scan' && req.method === 'POST') {
      const cfg = await getGuildConfig(guildId);
      if (cfg.tracked_clans.length === 0) {
        sendJson(res, { error: 'Aucun clan suivi — rien à scanner.' }, 400);
        return true;
      }
      await runGuildScan(client, guildId);
      sendJson(res, { ok: true });
      return true;
    }
  } catch (err) {
    logError('[dashboard] Échec requête API clan:', err);
    sendJson(res, { error: (err as Error).message }, 502);
    return true;
  }

  sendJson(res, { error: 'Route inconnue' }, 404);
  return true;
}
