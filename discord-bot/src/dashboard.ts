import { createServer } from 'node:http';
import type { Client } from 'discord.js';
import { getPlayerTotals, getDailyBreakdown } from './voice/history.js';

const HISTORY_DAYS = 30;

// ── État en mémoire ─────────────────────────────────────────────────────────

interface VoiceSession {
  userId: string;
  username: string;
  channelName: string;
  joinedAt: number;
}

const MAX_LOG_LINES = 300;
const logBuffer: string[] = [];
const activeVoice = new Map<string, VoiceSession>();

export function pushLog(line: string): void {
  logBuffer.push(line);
  if (logBuffer.length > MAX_LOG_LINES) logBuffer.shift();
}

export function voiceJoin(userId: string, username: string, channelName: string): void {
  activeVoice.set(userId, { userId, username, channelName, joinedAt: Date.now() });
}

export function voiceMove(userId: string, channelName: string): void {
  const session = activeVoice.get(userId);
  if (session) session.channelName = channelName;
  else activeVoice.set(userId, { userId, username: userId, channelName, joinedAt: Date.now() });
}

export function voiceLeave(userId: string): void {
  activeVoice.delete(userId);
}

// ── Serveur HTTP ────────────────────────────────────────────────────────────

export function startDashboard(client: Client, port: number): void {
  const server = createServer((req, res) => {
    const url = req.url ?? '/';

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
      const sessions = [...activeVoice.values()]
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
      res.end(JSON.stringify(logBuffer));
      return;
    }

    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  });

  server.listen(port, () => {
    pushLog(`[DASHBOARD] Disponible sur http://localhost:${port}`);
  });
}

// ── Page HTML (vanilla JS, polling toutes les 3s) ───────────────────────────

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ATFR Discord Bot — Dashboard</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, Segoe UI, Roboto, sans-serif;
    background: #0f1115;
    color: #e6e6e6;
    padding: 24px;
  }
  h1 { font-size: 20px; margin: 0 0 16px; }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .card {
    background: #1a1d24;
    border: 1px solid #2a2e37;
    border-radius: 10px;
    padding: 16px;
  }
  .card h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #9aa0ad; margin: 0 0 12px; }
  .status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 14px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: #555; }
  .dot.online { background: #3ddc84; box-shadow: 0 0 8px #3ddc8488; }
  .dot.offline { background: #e5484d; box-shadow: 0 0 8px #e5484d88; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #2a2e37; }
  th { color: #9aa0ad; font-weight: 500; }
  #logs {
    background: #0b0d11;
    border: 1px solid #2a2e37;
    border-radius: 10px;
    padding: 12px;
    height: 360px;
    overflow-y: auto;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
  }
  .empty { color: #6b7280; font-size: 13px; }
  .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .card-head h2 { margin: 0; }
  select {
    background: #0b0d11;
    color: #e6e6e6;
    border: 1px solid #2a2e37;
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 13px;
  }
  .hist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 880px) { .hist-grid, .grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
  <h1>ATFR Discord Bot — Tableau de bord</h1>
  <div class="grid">
    <div class="card">
      <h2>Statut</h2>
      <div id="status"></div>
    </div>
    <div class="card">
      <h2>En vocal en ce moment</h2>
      <div id="voice"></div>
    </div>
  </div>
  <div class="hist-grid">
    <div class="card">
      <h2>Temps vocal cumulé — 30 derniers jours</h2>
      <div id="histTotals"></div>
    </div>
    <div class="card">
      <div class="card-head">
        <h2>Détail par jour</h2>
        <select id="histDaySelect"></select>
      </div>
      <div id="histDay"></div>
    </div>
  </div>
  <div class="card">
    <h2>Logs en direct</h2>
    <div id="logs"></div>
  </div>

<script>
function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'm';
  if (m > 0) return m + 'm ' + String(s).padStart(2, '0') + 's';
  return s + 's';
}

async function refreshStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    document.getElementById('status').innerHTML = \`
      <div class="status-row"><span class="dot \${data.connected ? 'online' : 'offline'}"></span>
        \${data.connected ? 'Connecté' : 'Déconnecté'} — \${data.tag ?? '—'}</div>
      <div class="status-row">Serveur : \${data.guildName ?? '—'} (\${data.memberCount ?? '—'} membres)</div>
      <div class="status-row">Ping : \${data.ping} ms</div>
      <div class="status-row">Actif depuis : \${fmtDuration(data.uptimeSeconds)}</div>
    \`;
  } catch {
    document.getElementById('status').innerHTML = '<div class="empty">Impossible de joindre le bot.</div>';
  }
}

async function refreshVoice() {
  try {
    const res = await fetch('/api/voice');
    const sessions = await res.json();
    if (sessions.length === 0) {
      document.getElementById('voice').innerHTML = '<div class="empty">Personne en vocal actuellement.</div>';
      return;
    }
    const rows = sessions.map((s) =>
      \`<tr><td>\${s.username}</td><td>\${s.channelName}</td><td>\${fmtDuration(s.durationSeconds)}</td></tr>\`
    ).join('');
    document.getElementById('voice').innerHTML = \`
      <table><thead><tr><th>Membre</th><th>Salon</th><th>Durée</th></tr></thead><tbody>\${rows}</tbody></table>
    \`;
  } catch {
    document.getElementById('voice').innerHTML = '<div class="empty">—</div>';
  }
}

async function refreshLogs() {
  try {
    const res = await fetch('/api/logs');
    const lines = await res.json();
    const el = document.getElementById('logs');
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    el.textContent = lines.join('\\n');
    if (atBottom) el.scrollTop = el.scrollHeight;
  } catch {
    /* ignore */
  }
}

function fmtDateLabel(isoDate) {
  const d = new Date(isoDate + 'T00:00:00Z');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' });
}

async function refreshHistoryTotals() {
  try {
    const res = await fetch('/api/voice-history/totals');
    const totals = await res.json();
    if (totals.length === 0) {
      document.getElementById('histTotals').innerHTML = '<div class="empty">Pas encore de données — laisse tourner le bot quelques jours.</div>';
      return;
    }
    const rows = totals.map((t) =>
      \`<tr><td>\${t.username}</td><td>\${fmtDuration(t.totalSeconds)}</td><td>\${t.sessionCount}</td></tr>\`
    ).join('');
    document.getElementById('histTotals').innerHTML = \`
      <table><thead><tr><th>Membre</th><th>Temps cumulé</th><th>Sessions</th></tr></thead><tbody>\${rows}</tbody></table>
    \`;
  } catch {
    document.getElementById('histTotals').innerHTML = '<div class="empty">—</div>';
  }
}

let historyDays = [];

function renderHistoryDay(date) {
  const day = historyDays.find((d) => d.date === date);
  const el = document.getElementById('histDay');
  if (!day || day.players.length === 0) {
    el.innerHTML = '<div class="empty">Aucune activité vocale ce jour-là.</div>';
    return;
  }
  const rows = day.players.map((p) =>
    \`<tr><td>\${p.username}</td><td>\${fmtDuration(p.seconds)}</td></tr>\`
  ).join('');
  el.innerHTML = \`
    <div class="status-row">Total ce jour : \${fmtDuration(day.totalSeconds)}</div>
    <table><thead><tr><th>Membre</th><th>Temps</th></tr></thead><tbody>\${rows}</tbody></table>
  \`;
}

async function loadHistoryDaily() {
  try {
    const res = await fetch('/api/voice-history/daily');
    historyDays = await res.json();
    const select = document.getElementById('histDaySelect');
    const previous = select.value;
    if (historyDays.length === 0) {
      select.innerHTML = '<option value="">—</option>';
      document.getElementById('histDay').innerHTML = '<div class="empty">Pas encore de données.</div>';
      return;
    }
    select.innerHTML = historyDays.map((d) => \`<option value="\${d.date}">\${fmtDateLabel(d.date)}</option>\`).join('');
    const toSelect = historyDays.some((d) => d.date === previous) ? previous : historyDays[0].date;
    select.value = toSelect;
    renderHistoryDay(toSelect);
  } catch {
    document.getElementById('histDay').innerHTML = '<div class="empty">—</div>';
  }
}

document.getElementById('histDaySelect').addEventListener('change', (e) => {
  renderHistoryDay(e.target.value);
});

function refreshAll() {
  refreshStatus();
  refreshVoice();
  refreshLogs();
  refreshHistoryTotals();
}

refreshAll();
loadHistoryDaily();
setInterval(refreshAll, 3000);
setInterval(loadHistoryDaily, 60_000);
</script>
</body>
</html>`;
