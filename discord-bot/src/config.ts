import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config as loadEnv } from 'dotenv';

// Charge le .env situé à la racine du projet (dist/config.js → ../.env)
const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, '..', '.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export const config = {
  discord: {
    botToken: required('DISCORD_BOT_TOKEN'),
    guildId: process.env.DISCORD_GUILD_ID || null,
  },
  site: {
    url: required('SITE_URL').replace(/\/$/, ''),
    syncSecret: required('DISCORD_SYNC_SECRET'),
  },
  behaviour: {
    syncCron: process.env.SYNC_CRON ?? '0 3 * * *',
    debug: process.env.DEBUG === 'true',
    dashboardPort: Number(process.env.DASHBOARD_PORT ?? '3000'),
  },
  clanTracker: {
    // Sans clé WG, le module de suivi de clans reste désactivé (le bot
    // continue de fonctionner pour le vocal).
    wotApplicationId: process.env.WOT_APPLICATION_ID || null,
    wgApiBase: process.env.WG_API_BASE ?? 'https://api.worldoftanks.eu/wot',
    defaultScanIntervalMinutes: Number(process.env.CLAN_SCAN_INTERVAL_MINUTES ?? '15'),
    defaultTrackedClanIds: (process.env.DEFAULT_TRACKED_CLAN_IDS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isFinite(n)),
  },
};

export const endpoints = {
  voiceEvent: `${config.site.url}/.netlify/functions/discord-voice-event`,
  memberSync: `${config.site.url}/.netlify/functions/discord-sync-members`,
  clanSync: `${config.site.url}/.netlify/functions/discord-clan-sync`,
  clanConfig: `${config.site.url}/.netlify/functions/discord-clan-config`,
  clanMovements: `${config.site.url}/.netlify/functions/discord-clan-movements`,
};
