export const DASHBOARD_HTML = `<!DOCTYPE html>
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
  h2.section-title { font-size: 16px; margin: 28px 0 12px; color: #cbd2dd; }
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
  select, input[type="text"], input[type="number"], textarea {
    background: #0b0d11;
    color: #e6e6e6;
    border: 1px solid #2a2e37;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 13px;
    font-family: inherit;
  }
  textarea { width: 100%; min-height: 90px; resize: vertical; }
  button {
    background: #2f6fed;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
  }
  button:hover { background: #4a85f7; }
  button.danger { background: #c0392b; }
  button.danger:hover { background: #e0473a; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
  .row label { font-size: 13px; color: #9aa0ad; min-width: 130px; }
  .msg { font-size: 13px; margin-top: 6px; }
  .msg.ok { color: #3ddc84; }
  .msg.err { color: #e5484d; }
  .hist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .clan-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; }
  .tag { display: inline-block; background: #2a2e37; border-radius: 4px; padding: 1px 6px; font-size: 12px; margin-right: 4px; }
  @media (max-width: 880px) { .hist-grid, .grid, .clan-grid { grid-template-columns: 1fr; } }
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

  <h2 class="section-title">Suivi des clans World of Tanks</h2>
  <div class="clan-grid">
    <div class="card">
      <h2>Configuration</h2>
      <div class="row">
        <label>Salon de notification</label>
        <select id="clanChannelSelect"></select>
        <button id="clanChannelSave">Enregistrer</button>
      </div>
      <div class="row">
        <label>Intervalle de scan (min)</label>
        <input type="number" id="clanIntervalInput" min="5" max="1440" style="width: 80px" />
        <button id="clanIntervalSave">Enregistrer</button>
      </div>
      <div class="row">
        <label><input type="checkbox" id="clanNotifyLeavesOnly" /> Notifier Discord uniquement pour les sorties</label>
      </div>
      <div class="row">
        <button id="clanScanNow">Scanner maintenant</button>
      </div>
      <div id="clanConfigMsg" class="msg"></div>
    </div>
    <div class="card">
      <h2>Ajouter un clan</h2>
      <div class="row">
        <input type="text" id="clanAddInput" placeholder="Tag ou ID (ex: ATFR ou 500000123)" style="flex:1" />
        <button id="clanAddSubmit">Ajouter</button>
      </div>
      <div id="clanAddMsg" class="msg"></div>
      <h2 style="margin-top:16px">Ajout en masse</h2>
      <textarea id="clanBulkInput" placeholder="Tags ou IDs séparés par des virgules, espaces ou retours à la ligne"></textarea>
      <div class="row" style="margin-top:8px">
        <button id="clanBulkSubmit">Ajouter la liste</button>
      </div>
      <div id="clanBulkResult"></div>
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <div class="card-head">
      <h2>Clans suivis</h2>
    </div>
    <div id="clanList"></div>
  </div>
  <div class="card" style="margin-top:16px">
    <h2>Derniers mouvements</h2>
    <div id="clanMovements"></div>
  </div>

  <div class="card" style="margin-top:16px">
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

// ── Suivi des clans ─────────────────────────────────────────────────────────

function setMsg(elId, text, ok) {
  const el = document.getElementById(elId);
  el.textContent = text;
  el.className = 'msg ' + (ok ? 'ok' : 'err');
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('Erreur ' + res.status));
  return data;
}

let clanChannels = [];

function renderClanList(cfg) {
  const el = document.getElementById('clanList');
  if (!cfg || cfg.tracked_clans.length === 0) {
    el.innerHTML = '<div class="empty">Aucun clan suivi pour le moment.</div>';
    return;
  }
  const rows = cfg.tracked_clans.map((c) => \`
    <tr>
      <td>\${c.clan_tag ? '<span class="tag">' + c.clan_tag + '</span>' : ''}\${c.clan_name ?? ''}</td>
      <td>\${c.clan_id}</td>
      <td><button class="danger" data-remove="\${c.clan_id}">Retirer</button></td>
    </tr>
  \`).join('');
  el.innerHTML = \`
    <table><thead><tr><th>Clan</th><th>ID</th><th></th></tr></thead><tbody>\${rows}</tbody></table>
  \`;
  el.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const data = await postJson('/api/clan/remove', { clan_id: Number(btn.dataset.remove) });
        renderClanList(data.config);
      } catch (err) {
        alert(err.message);
        btn.disabled = false;
      }
    });
  });
}

function renderClanConfig(data) {
  const cfg = data.config;
  clanChannels = data.channels ?? [];
  const select = document.getElementById('clanChannelSelect');
  select.innerHTML = '<option value="">— aucun —</option>' + clanChannels
    .map((c) => \`<option value="\${c.id}">#\${c.name}</option>\`).join('');
  select.value = cfg.clan_notify_channel_id ?? '';
  document.getElementById('clanIntervalInput').value = cfg.scan_interval_minutes;
  document.getElementById('clanNotifyLeavesOnly').checked = Boolean(cfg.notify_leaves_only);
  renderClanList(cfg);
}

async function refreshClanConfig() {
  try {
    const res = await fetch('/api/clan/config');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    renderClanConfig(data);
  } catch (err) {
    document.getElementById('clanList').innerHTML = '<div class="empty">' + err.message + '</div>';
  }
}

async function refreshClanMovements() {
  try {
    const res = await fetch('/api/clan/movements?limit=25');
    const data = await res.json();
    const movements = data.movements ?? [];
    const el = document.getElementById('clanMovements');
    if (movements.length === 0) {
      el.innerHTML = '<div class="empty">Aucun mouvement enregistré pour le moment.</div>';
      return;
    }
    const rows = movements.map((m) => {
      const icon = m.event === 'join' ? '🟢 Entrée' : '🔴 Sortie';
      const clanLabel = m.clan_tag ? '[' + m.clan_tag + ']' : ('#' + m.clan_id);
      const date = new Date(m.occurred_at).toLocaleString('fr-FR');
      return \`<tr><td>\${icon}</td><td>\${m.account_name}</td><td>\${clanLabel}</td><td>\${date}</td></tr>\`;
    }).join('');
    el.innerHTML = \`
      <table><thead><tr><th>Type</th><th>Joueur</th><th>Clan</th><th>Date</th></tr></thead><tbody>\${rows}</tbody></table>
    \`;
  } catch {
    document.getElementById('clanMovements').innerHTML = '<div class="empty">—</div>';
  }
}

document.getElementById('clanChannelSave').addEventListener('click', async () => {
  const channelId = document.getElementById('clanChannelSelect').value || null;
  try {
    const data = await postJson('/api/clan/channel', { channel_id: channelId });
    setMsg('clanConfigMsg', 'Salon de notification mis à jour.', true);
    renderClanConfig({ config: data.config, channels: clanChannels });
  } catch (err) {
    setMsg('clanConfigMsg', err.message, false);
  }
});

document.getElementById('clanIntervalSave').addEventListener('click', async () => {
  const minutes = Number(document.getElementById('clanIntervalInput').value);
  try {
    const data = await postJson('/api/clan/interval', { minutes });
    setMsg('clanConfigMsg', 'Intervalle de scan mis à jour.', true);
    renderClanConfig({ config: data.config, channels: clanChannels });
  } catch (err) {
    setMsg('clanConfigMsg', err.message, false);
  }
});

document.getElementById('clanNotifyLeavesOnly').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  try {
    const data = await postJson('/api/clan/notify-leaves-only', { enabled });
    setMsg('clanConfigMsg', enabled ? 'Notifications limitées aux sorties.' : 'Notifications entrées + sorties.', true);
    renderClanConfig({ config: data.config, channels: clanChannels });
  } catch (err) {
    e.target.checked = !enabled;
    setMsg('clanConfigMsg', err.message, false);
  }
});

document.getElementById('clanScanNow').addEventListener('click', async (e) => {
  e.target.disabled = true;
  setMsg('clanConfigMsg', 'Scan en cours...', true);
  try {
    await postJson('/api/clan/scan', {});
    setMsg('clanConfigMsg', 'Scan terminé.', true);
    refreshClanMovements();
  } catch (err) {
    setMsg('clanConfigMsg', err.message, false);
  } finally {
    e.target.disabled = false;
  }
});

document.getElementById('clanAddSubmit').addEventListener('click', async (e) => {
  const input = document.getElementById('clanAddInput');
  const value = input.value.trim();
  if (!value) return;
  e.target.disabled = true;
  try {
    const data = await postJson('/api/clan/add', { clan: value });
    setMsg('clanAddMsg', 'Clan ajouté : ' + (data.resolved.tag ?? data.resolved.clanId), true);
    input.value = '';
    renderClanList(data.config);
  } catch (err) {
    setMsg('clanAddMsg', err.message, false);
  } finally {
    e.target.disabled = false;
  }
});

document.getElementById('clanBulkSubmit').addEventListener('click', async (e) => {
  const textarea = document.getElementById('clanBulkInput');
  const value = textarea.value.trim();
  if (!value) return;
  e.target.disabled = true;
  const resultEl = document.getElementById('clanBulkResult');
  resultEl.innerHTML = '<div class="empty">Traitement en cours, cela peut prendre un moment...</div>';
  try {
    const data = await postJson('/api/clan/bulk-add', { clans: value });
    const added = data.results.filter((r) => r.status === 'added').length;
    const already = data.results.filter((r) => r.status === 'already_tracked').length;
    const notFound = data.results.filter((r) => r.status === 'not_found');
    const errors = data.results.filter((r) => r.status === 'error');
    let html = '<div class="msg ok">' + added + ' ajouté(s), ' + already + ' déjà suivi(s)</div>';
    if (notFound.length > 0) html += '<div class="msg err">Introuvables : ' + notFound.map((r) => r.input).join(', ') + '</div>';
    if (errors.length > 0) html += '<div class="msg err">Erreurs : ' + errors.map((r) => r.input).join(', ') + '</div>';
    resultEl.innerHTML = html;
    renderClanList(data.config);
  } catch (err) {
    resultEl.innerHTML = '<div class="msg err">' + err.message + '</div>';
  } finally {
    e.target.disabled = false;
  }
});

function refreshAll() {
  refreshStatus();
  refreshVoice();
  refreshLogs();
  refreshHistoryTotals();
  refreshClanMovements();
}

refreshAll();
loadHistoryDaily();
refreshClanConfig();
setInterval(refreshAll, 3000);
setInterval(loadHistoryDaily, 60_000);
setInterval(refreshClanConfig, 15_000);
</script>
</body>
</html>`;
