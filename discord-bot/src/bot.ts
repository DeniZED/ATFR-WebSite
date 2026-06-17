import { Client, GatewayIntentBits, Events } from 'discord.js';
import { config } from './config.js';
import { log, error as logError } from './logger.js';
import { startDashboard } from './dashboard.js';
import { startVoiceHistory, flushVoiceHistory } from './voice/history.js';
import { registerVoiceTracking, primeOpenVoiceSessions } from './voice/tracker.js';
import { registerMemberSyncTriggers } from './memberSync.js';
import { startScheduler } from './scheduler.js';
import { registerCommands } from './commands/registry.js';
import { registerInteractionHandler } from './commands/handleInteraction.js';
import { getGuildConfig, addTrackedClan } from './guildConfig.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once(Events.ClientReady, async (c) => {
  log(`Bot connecté : ${c.user.tag}`);
  log(`Serveur cible : ${config.discord.guildId ?? '(tous)'}`);
  log(`Cron sync membres : ${config.behaviour.syncCron}`);

  startDashboard(client, config.behaviour.dashboardPort);
  startVoiceHistory();
  log(`Dashboard disponible sur http://localhost:${config.behaviour.dashboardPort}`);

  primeOpenVoiceSessions(client);

  if (config.discord.guildId) await seedDefaultTrackedClans(config.discord.guildId);

  await registerCommands(client);
  startScheduler(client);
});

/** Seed la liste de clans suivis depuis DEFAULT_TRACKED_CLAN_IDS au premier démarrage. */
async function seedDefaultTrackedClans(guildId: string): Promise<void> {
  if (config.clanTracker.defaultTrackedClanIds.length === 0) return;
  const cfg = await getGuildConfig(guildId);
  if (cfg.tracked_clans.length > 0) return;

  for (const clanId of config.clanTracker.defaultTrackedClanIds) {
    await addTrackedClan(guildId, clanId, null, null, 'bootstrap').catch((err) =>
      logError(`Échec du seed du clan par défaut ${clanId}:`, err),
    );
  }
  log(`Clans par défaut chargés : ${config.clanTracker.defaultTrackedClanIds.join(', ')}`);
}

registerVoiceTracking(client);
registerMemberSyncTriggers(client);
registerInteractionHandler(client);

// Graceful shutdown
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    log(`Arrêt du bot (${signal})`);
    flushVoiceHistory();
    client.destroy();
    process.exit(0);
  });
}

process.on('unhandledRejection', (err) => {
  logError('unhandledRejection:', err);
});

client.login(config.discord.botToken);
