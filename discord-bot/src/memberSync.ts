import { Events, type Client, type GuildMember } from 'discord.js';
import { config } from './config.js';
import { log, error as logError } from './logger.js';
import { triggerMemberSync } from './supabaseSync.js';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleMemberSync(reason: string): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  // Debounce: attend 10 s au cas où plusieurs membres rejoignent/quittent d'un coup
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    log(`[SYNC] Déclenchement de la sync membres (raison : ${reason})`);
    triggerMemberSync(config.discord.guildId)
      .then((data) => log('[SYNC] Terminé :', data ?? '(pas de contenu)'))
      .catch((err) => logError('Échec de la sync:', err));
  }, 10_000);
}

export function registerMemberSyncTriggers(client: Client): void {
  client.on(Events.GuildMemberAdd, (member: GuildMember) => {
    if (config.discord.guildId && member.guild.id !== config.discord.guildId) return;
    log(`[MEMBER] Arrivée : ${member.user.username}`);
    scheduleMemberSync(`${member.user.username} a rejoint`);
  });

  client.on(Events.GuildMemberRemove, (member) => {
    if (config.discord.guildId && member.guild.id !== config.discord.guildId) return;
    log(`[MEMBER] Départ : ${member.user.username}`);
    scheduleMemberSync(`${member.user.username} a quitté`);
  });
}
