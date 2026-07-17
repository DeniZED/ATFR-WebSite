import { Events, type ChatInputCommandInteraction, type Client } from 'discord.js';
import { handleClanCommand } from './clanCommands.js';
import { handleVoiceCommand } from './voiceCommands.js';
import { handleStatsCommand, handlePingCommand } from './playerCommands.js';
import { handleCharCommand } from './tankopediaCommands.js';
import { handleCompareCommand } from './compareCommands.js';
import { handleQuizCommand } from './quizCommands.js';
import { handleQuizAdminCommand } from './quizAdminCommands.js';
import { error as logError } from '../logger.js';

const handlers: Record<string, (interaction: ChatInputCommandInteraction) => Promise<void>> = {
  clan: handleClanCommand,
  voice: handleVoiceCommand,
  stats: handleStatsCommand,
  ping: handlePingCommand,
  char: handleCharCommand,
  compare: handleCompareCommand,
  quiz: handleQuizCommand,
  'quiz-admin': handleQuizAdminCommand,
};

export function registerInteractionHandler(client: Client): void {
  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const handler = handlers[interaction.commandName];
    if (!handler) return;

    handler(interaction).catch((err) => {
      logError(`Échec du gestionnaire d'interaction (${interaction.commandName}):`, err);
      if (interaction.deferred || interaction.replied) {
        interaction.editReply('Une erreur interne est survenue.').catch(() => {});
      } else {
        interaction.reply({ content: 'Une erreur interne est survenue.', ephemeral: true }).catch(() => {});
      }
    });
  });
}
