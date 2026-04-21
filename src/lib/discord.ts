import { env } from '@/lib/env';
import { tomatoProfileUrl } from '@/lib/tomato-api';

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  url?: string;
  fields?: DiscordEmbedField[];
  timestamp?: string;
  footer?: { text: string };
}

export async function postDiscordEmbed(embed: DiscordEmbed): Promise<void> {
  if (!env.discordWebhookUrl) {
    console.warn('[discord] VITE_DISCORD_WEBHOOK_URL is not set, skipping.');
    return;
  }

  try {
    await fetch(env.discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (error) {
    console.error('[discord] webhook failed', error);
  }
}

export interface ApplicationNotificationPayload {
  playerName: string;
  discordTag: string;
  targetClan: string;
  wn8: number | null;
  winRate: number | null;
  battles: number | null;
  tier10Count: number | null;
  availability: string;
  motivation: string;
  previousClans?: string | null;
}

export function notifyNewApplication(app: ApplicationNotificationPayload) {
  return postDiscordEmbed({
    title: `Nouvelle candidature pour ${app.targetClan}`,
    color: 0xe8b043,
    url: tomatoProfileUrl(app.playerName),
    fields: [
      { name: 'Joueur', value: app.playerName, inline: true },
      { name: 'Discord', value: app.discordTag, inline: true },
      { name: 'Clan visé', value: app.targetClan, inline: true },
      { name: 'WN8', value: app.wn8 != null ? Math.round(app.wn8).toString() : '—', inline: true },
      {
        name: 'Winrate',
        value: app.winRate != null ? `${app.winRate.toFixed(2)}%` : '—',
        inline: true,
      },
      {
        name: 'Batailles',
        value: app.battles != null ? app.battles.toLocaleString('fr-FR') : '—',
        inline: true,
      },
      { name: 'Chars Tier X', value: app.tier10Count != null ? String(app.tier10Count) : '—', inline: true },
      { name: 'Clan actuel', value: app.previousClans || 'Aucun', inline: true },
      { name: 'Disponibilités', value: app.availability || '—' },
      { name: 'Motivation', value: app.motivation.slice(0, 1000) },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'ATFR Recrutement' },
  });
}
