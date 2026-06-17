import type { Client } from 'discord.js';
import { log, warn, error as logError } from '../logger.js';
import { fetchClanRoster } from './wgClient.js';
import { syncClanRoster, getPlayerStats } from '../supabaseSync.js';
import { getGuildConfig } from '../guildConfig.js';
import { buildClanMovementEmbed } from '../notifications/clanEmbeds.js';
import type { ClanMovement, TrackedClanEntry } from './types.js';

export async function scanAllClansForGuild(client: Client, guildId: string): Promise<void> {
  const cfg = await getGuildConfig(guildId);
  if (cfg.tracked_clans.length === 0) return;

  for (const clan of cfg.tracked_clans) {
    try {
      await scanClanForGuild(client, guildId, clan, cfg.clan_notify_channel_id, cfg.notify_leaves_only);
    } catch (err) {
      logError(`Clan scan failed (guild=${guildId}, clan=${clan.clan_id}):`, err);
    }
  }
}

async function scanClanForGuild(
  client: Client,
  guildId: string,
  clan: TrackedClanEntry,
  notifyChannelId: string | null,
  notifyLeavesOnly: boolean,
): Promise<void> {
  const roster = await fetchClanRoster(clan.clan_id);
  if (!roster) {
    warn(`Clan ${clan.clan_id} introuvable via l'API WG (guild=${guildId})`);
    return;
  }

  const result = await syncClanRoster({
    guild_id: guildId,
    clan_id: clan.clan_id,
    clan_tag: roster.tag ?? clan.clan_tag,
    members: roster.members,
  });
  if (!result) return;

  const clanLabel = roster.tag ?? clan.clan_tag ?? `#${clan.clan_id}`;

  if (result.bootstrap) {
    log(`Clan ${clanLabel} initialisé (${roster.members.length} membre(s))`);
    return;
  }

  const movements: ClanMovement[] = [...result.joins, ...result.leaves];
  if (movements.length === 0) return;

  log(`Clan ${clanLabel} : ${result.joins.length} entrée(s), ${result.leaves.length} sortie(s)`);

  if (!notifyChannelId) return;
  const channel = await client.channels.fetch(notifyChannelId).catch(() => null);
  if (!channel || !channel.isSendable()) {
    warn(`Salon de notification ${notifyChannelId} invalide pour le serveur ${guildId}`);
    return;
  }

  const notifiable = notifyLeavesOnly ? result.leaves : movements;
  for (const movement of notifiable) {
    const stats = await getPlayerStats(movement.account_id).catch((err: unknown) => {
      warn(`Stats indisponibles pour le joueur ${movement.account_id}: ${String(err)}`);
      return null;
    });
    const embed = buildClanMovementEmbed({
      clanTag: roster.tag ?? clan.clan_tag,
      clanName: roster.name ?? clan.clan_name,
      accountId: movement.account_id,
      accountName: movement.account_name,
      role: movement.role,
      event: movement.event,
      occurredAt: new Date(),
      stats,
    });
    await channel.send({ embeds: [embed] }).catch((err: unknown) =>
      logError("Échec de l'envoi de la notification de mouvement de clan:", err),
    );
  }
}
