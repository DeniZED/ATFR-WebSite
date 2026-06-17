import type { Client } from 'discord.js';
import cron from 'node-cron';
import { config } from './config.js';
import { log, error as logError } from './logger.js';
import { triggerMemberSync } from './supabaseSync.js';
import { getGuildConfig } from './guildConfig.js';
import { scanAllClansForGuild } from './clan/scanner.js';

const CHECK_INTERVAL_MS = 60_000;
const lastScanAt = new Map<string, number>();

function trackedGuildIds(client: Client): string[] {
  if (config.discord.guildId) return [config.discord.guildId];
  return [...client.guilds.cache.keys()];
}

export async function runGuildScan(client: Client, guildId: string): Promise<void> {
  lastScanAt.set(guildId, Date.now());
  await scanAllClansForGuild(client, guildId);
}

async function maybeScanGuild(client: Client, guildId: string): Promise<void> {
  const cfg = await getGuildConfig(guildId);
  const last = lastScanAt.get(guildId) ?? 0;
  if (Date.now() - last < cfg.scan_interval_minutes * 60_000) return;
  await runGuildScan(client, guildId);
}

export function startScheduler(client: Client): void {
  cron.schedule(config.behaviour.syncCron, () => {
    log('[CRON] Lancement sync membres planifiée');
    triggerMemberSync(config.discord.guildId)
      .then((data) => log('[SYNC] Terminé :', data ?? '(pas de contenu)'))
      .catch((err) => logError('Échec de la sync membres planifiée:', err));

    log('[CRON] Lancement du scan de clans planifié (filet de sécurité quotidien)');
    for (const guildId of trackedGuildIds(client)) {
      runGuildScan(client, guildId).catch((err) =>
        logError(`Échec du scan de clans planifié (guild=${guildId}):`, err),
      );
    }
  });

  setInterval(() => {
    for (const guildId of trackedGuildIds(client)) {
      maybeScanGuild(client, guildId).catch((err) =>
        logError(`Échec du scan de clans (guild=${guildId}):`, err),
      );
    }
  }, CHECK_INTERVAL_MS);
}
