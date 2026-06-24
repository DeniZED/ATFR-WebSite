import { Events, type Client, type VoiceState } from 'discord.js';
import { config } from '../config.js';
import { debug, log } from '../logger.js';
import { voiceJoin, voiceMove, voiceLeave } from '../dashboard/index.js';
import { recordJoin, recordMove, recordLeave } from './history.js';
import { sendVoiceEvent } from '../supabaseSync.js';

function detectVoiceEvent(oldState: VoiceState, newState: VoiceState): 'join' | 'leave' | 'move' | null {
  const wasIn = oldState.channelId !== null;
  const isIn = newState.channelId !== null;
  if (!wasIn && isIn) return 'join';
  if (wasIn && !isIn) return 'leave';
  if (wasIn && isIn && oldState.channelId !== newState.channelId) return 'move';
  return null; // mute/deafen/stream — ignoré
}

async function resolveUsername(
  newState: VoiceState,
  oldState: VoiceState,
  userId: string,
): Promise<string> {
  const cached = newState.member ?? oldState.member;
  if (cached) return cached.displayName || cached.user.username;

  try {
    const member = await newState.guild.members.fetch(userId);
    return member.displayName || member.user.username;
  } catch {
    return userId;
  }
}

async function handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
  const eventType = detectVoiceEvent(oldState, newState);
  if (!eventType) return;

  const userId = newState.member?.id ?? oldState.member?.id;
  if (!userId) return;

  const activeState = eventType === 'leave' ? oldState : newState;
  const payload = {
    discord_user_id: userId,
    guild_id: newState.guild.id,
    channel_id: activeState.channelId,
    channel_name: activeState.channel?.name ?? null,
    event: eventType,
    occurred_at: new Date().toISOString(),
  };

  const username = await resolveUsername(newState, oldState, userId);
  const channelName = activeState.channel?.name ?? 'none';
  debug(`Voice ${eventType}: ${username} → ${channelName}`);

  if (eventType === 'join') {
    voiceJoin(userId, username, channelName);
    recordJoin(userId, username, channelName);
  } else if (eventType === 'move') {
    voiceMove(userId, channelName);
    recordMove(userId, username, channelName);
  } else {
    voiceLeave(userId);
    recordLeave(userId);
  }

  await sendVoiceEvent(payload);
}

export function registerVoiceTracking(client: Client): void {
  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if (config.discord.guildId && newState.guild.id !== config.discord.guildId) return;
    handleVoiceStateUpdate(oldState, newState).catch((err) => log('[ERROR] VoiceStateUpdate failed:', err));
  });
}

/**
 * Recharge les membres déjà en vocal au démarrage (le dashboard ne part pas de zéro).
 *
 * Envoie aussi un événement à Supabase pour chaque membre encore connecté :
 * si une session y était restée ouverte avant un redémarrage/crash du bot
 * (aucun "leave" reçu), elle est close maintenant plutôt que d'attendre le
 * prochain mouvement vocal de ce membre — qui peut survenir des heures ou
 * des jours plus tard et gonfler artificiellement la durée enregistrée.
 */
export function primeOpenVoiceSessions(client: Client): void {
  for (const guild of client.guilds.cache.values()) {
    if (config.discord.guildId && guild.id !== config.discord.guildId) continue;
    for (const voiceState of guild.voiceStates.cache.values()) {
      if (!voiceState.channelId || !voiceState.member) continue;
      const userId = voiceState.id;
      const username = voiceState.member.displayName || voiceState.member.user.username;
      const channelName = voiceState.channel?.name ?? 'inconnu';
      voiceJoin(userId, username, channelName);
      recordJoin(userId, username, channelName);

      sendVoiceEvent({
        discord_user_id: userId,
        guild_id: guild.id,
        channel_id: voiceState.channelId,
        channel_name: channelName,
        event: 'move',
        occurred_at: new Date().toISOString(),
      }).catch((err) => log('[ERROR] primeOpenVoiceSessions sendVoiceEvent failed:', err));
    }
  }
}
