import { STATUS_LABELS, type PlayerActivitySummary } from './activity';

function csvCell(value: string | number | null | undefined): string {
  const s = String(value ?? '');
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Export CSV (séparateur `;`, compatible Excel FR) du périmètre affiché. */
export function playersToCsv(players: PlayerActivitySummary[]): string {
  const header = [
    'Pseudo',
    'Statut',
    'Clan',
    'Discord',
    'account_id',
    'Score',
    'Niveau',
    'Batailles (periode)',
    'Vocal (min)',
    'Jours actifs',
    'Alertes',
    'Fiabilite',
    'Derniere activite WoT',
  ];
  const rows = players.map((s) => [
    s.player.nickname,
    STATUS_LABELS[s.player.status],
    s.player.current_clan_tag ?? '',
    s.discordLink?.discord_tag ?? s.discordLink?.discord_user_id ?? '',
    s.player.account_id ?? '',
    s.score.value,
    s.score.label,
    s.battleDelta ?? '',
    Math.round(s.voiceSeconds / 60),
    s.activeDays,
    s.activeAlerts.length,
    s.dataQuality.label,
    s.latestWotActivityAt ?? '',
  ]);
  return [header, ...rows]
    .map((r) => r.map(csvCell).join(';'))
    .join('\r\n');
}
