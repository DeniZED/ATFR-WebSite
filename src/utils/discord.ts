import { DISCORD_WEBHOOK_URL } from '../constants';
import type { Application } from '../types';

export async function sendDiscordNotification(application: Application): Promise<void> {
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `📝 Nouvelle candidature ${application.targetClan}`,
          color: 0xF4B223,
          fields: [
            { name: 'Joueur', value: application.playerName, inline: true },
            { name: 'WN8', value: application.wn8, inline: true },
            { name: 'Winrate', value: application.winRate, inline: true },
            { name: 'Discord', value: application.discordTag, inline: true },
            { name: 'Chars Tier X', value: application.tier10Count, inline: true },
            { name: 'Batailles', value: application.battles, inline: true },
            { name: 'Clan actuel', value: application.previousClans, inline: true },
            { name: 'Disponibilités', value: application.availability },
            { name: 'Motivation', value: application.motivation }
          ],
          timestamp: new Date().toISOString(),
          url: `https://tomato.gg/stats/EU/${encodeURIComponent(application.playerName)}`
        }]
      })
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification Discord:', error);
  }
}