import { createServer } from 'node:http';
import type { Client } from 'discord.js';
import { getPlayerTotals, getDailyBreakdown } from '../voice/history.js';
import { pushLog, getLogs, voiceJoin, voiceMove, voiceLeave, getActiveVoiceSessions } from './state.js';
import { isAuthorized, sendUnauthorized } from './auth.js';
import { handleClanApi } from './clanApi.js';
import { DASHBOARD_HTML } from './page.js';
import { config } from '../config.js';

export { pushLog, voiceJoin, voiceMove, voiceLeave };

const HISTORY_DAYS = 30;

export function startDashboard(client: Client, port: number): void {
  if (!config.behaviour.dashboardUsername || !config.behaviour.dashboardPassword) {
    pushLog(
      '[DASHBOARD] Aucune authentification configurée (DASHBOARD_USERNAME / DASHBOARD_PASSWORD) — accès libre.',
    );
  }

  const server = createServer((req, res) => {
    void (async () => {
      if (!isAuthorized(req)) {
        sendUnauthorized(res);
        return;
      }

      const url = req.url ?? '/';
      res.setHeader('Cache-Control', 'no-store');

      if (url === '/' || url === '/index.html') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(DASHBOARD_HTML);
        return;
      }

      if (url === '/api/status') {
        const guild = client.guilds.cache.first();
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(
          JSON.stringify({
            connected: client.isReady(),
            tag: client.user?.tag ?? null,
            guildName: guild?.name ?? null,
            memberCount: guild?.memberCount ?? null,
            ping: Math.round(client.ws.ping),
            uptimeSeconds: client.uptime ? Math.floor(client.uptime / 1000) : 0,
          }),
        );
        return;
      }

      if (url === '/api/voice') {
        const sessions = getActiveVoiceSessions()
          .map((s) => ({
            username: s.username,
            channelName: s.channelName,
            durationSeconds: Math.floor((Date.now() - s.joinedAt) / 1000),
          }))
          .sort((a, b) => b.durationSeconds - a.durationSeconds);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(sessions));
        return;
      }

      if (url === '/api/voice-history/totals') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(getPlayerTotals(HISTORY_DAYS)));
        return;
      }

      if (url === '/api/voice-history/daily') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(getDailyBreakdown(HISTORY_DAYS)));
        return;
      }

      if (url === '/api/logs') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(getLogs()));
        return;
      }

      if (await handleClanApi(req, res, client, url)) return;

      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('Not found');
    })();
  });

  server.listen(port, () => {
    pushLog(`[DASHBOARD] Disponible sur http://localhost:${port}`);
  });
}
