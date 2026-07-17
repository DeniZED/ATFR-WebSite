import { REST, Routes, type Client } from 'discord.js';
import { clanCommandDefinition } from './clanCommands.js';
import { voiceCommandDefinition } from './voiceCommands.js';
import { statsCommandDefinition, pingCommandDefinition } from './playerCommands.js';
import { charCommandDefinition } from './tankopediaCommands.js';
import { compareCommandDefinition } from './compareCommands.js';
import { clanInfoCommandDefinition } from './clanInfoCommands.js';
import { quizCommandDefinition } from './quizCommands.js';
import { quizAdminCommandDefinition } from './quizAdminCommands.js';
import { log, error as logError } from '../logger.js';
import { config } from '../config.js';

export const commandDefinitions = [
  clanCommandDefinition,
  voiceCommandDefinition,
  statsCommandDefinition,
  pingCommandDefinition,
  charCommandDefinition,
  compareCommandDefinition,
  clanInfoCommandDefinition,
  quizCommandDefinition,
  quizAdminCommandDefinition,
];

export async function registerCommands(client: Client): Promise<void> {
  if (!client.application) throw new Error('Client application is not ready');
  const rest = new REST().setToken(config.discord.botToken);
  const body = commandDefinitions.map((c) => c.toJSON());

  try {
    if (config.discord.guildId) {
      await rest.put(Routes.applicationGuildCommands(client.application.id, config.discord.guildId), { body });
      log(`Commandes slash enregistrées sur le serveur ${config.discord.guildId}`);
    } else {
      await rest.put(Routes.applicationCommands(client.application.id), { body });
      log('Commandes slash enregistrées globalement');
    }
  } catch (err) {
    logError("Échec de l'enregistrement des commandes slash:", err);
  }
}
