import type { Config } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_URL = process.env.DISCORD_RH_ALERTS_WEBHOOK_URL;
const MAX_PER_SECTION = 15;
const INACTIVE_DAYS_THRESHOLD = 14;

interface PlayerRow {
  id: string;
  nickname: string;
  account_id: number | null;
  status: string;
  last_wot_activity_at: string | null;
}

interface DiscordLinkRow {
  player_id: string | null;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

function formatList(
  title: string,
  items: string[],
  emptyLabel: string,
): string {
  if (items.length === 0) return `**${title}**\n${emptyLabel}`;
  const shown = items.slice(0, MAX_PER_SECTION);
  const more = items.length - shown.length;
  const lines = shown.map((line) => `• ${line}`);
  if (more > 0) lines.push(`… et ${more} autre(s)`);
  return `**${title}**\n${lines.join('\n')}`;
}

export default async function handler(): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[rh-digest] Supabase service role not configured');
    return;
  }
  if (!WEBHOOK_URL) {
    console.log('[rh-digest] DISCORD_RH_ALERTS_WEBHOOK_URL not configured — skipping');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id, nickname, account_id, status, last_wot_activity_at')
    .neq('status', 'former');

  if (playersError) {
    console.error('[rh-digest] failed to load players:', playersError.message);
    return;
  }
  if (!players || players.length === 0) {
    console.log('[rh-digest] no players to report on');
    return;
  }

  const { data: links } = await supabase
    .from('player_discord_links')
    .select('player_id')
    .eq('is_primary', true);

  const linkedPlayerIds = new Set(
    (links ?? []).map((l: DiscordLinkRow) => l.player_id).filter(Boolean) as string[],
  );

  const inactive: string[] = [];
  const watch: string[] = [];
  const noDiscord: string[] = [];
  const noWot: string[] = [];

  for (const p of players as PlayerRow[]) {
    const days = daysSince(p.last_wot_activity_at);

    if (p.status === 'inactive' || (days != null && days >= INACTIVE_DAYS_THRESHOLD)) {
      inactive.push(
        days != null ? `${p.nickname} — inactif depuis ${days} j` : `${p.nickname} — aucune activité enregistrée`,
      );
    }
    if (p.status === 'watch') {
      watch.push(p.nickname);
    }
    if (!linkedPlayerIds.has(p.id)) {
      noDiscord.push(p.nickname);
    }
    if (!p.account_id) {
      noWot.push(p.nickname);
    }
  }

  const sections = [
    formatList(`🔴 Inactifs (≥ ${INACTIVE_DAYS_THRESHOLD} j sans activité WoT)`, inactive, 'Aucun — RAS.'),
    formatList('🟡 À surveiller', watch, 'Aucun.'),
    formatList('🔗 Sans compte Discord lié', noDiscord, 'Tous les joueurs sont liés.'),
    formatList('🎮 Sans compte WoT renseigné', noWot, 'Tous les joueurs ont un compte WoT.'),
  ];

  const embed = {
    title: '📋 Rapport RH hebdomadaire — ATFR',
    description: sections.join('\n\n'),
    color: 0xd4af37,
    timestamp: new Date().toISOString(),
    footer: { text: `${players.length} joueur(s) suivi(s)` },
  };

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[rh-digest] webhook POST failed (${res.status}): ${text}`);
    return;
  }

  console.log(
    `[rh-digest] sent — ${inactive.length} inactif(s), ${watch.length} à surveiller, ${noDiscord.length} sans Discord, ${noWot.length} sans WoT`,
  );
}

// Every Monday at 08:00 UTC
export const config: Config = {
  schedule: '0 8 * * 1',
};
