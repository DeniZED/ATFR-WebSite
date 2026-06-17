import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
  type ChatInputCommandInteraction,
} from 'discord.js';
import {
  addTrackedClan,
  removeTrackedClan,
  setNotifyChannel,
  getGuildConfig,
  refreshGuildConfig,
} from '../guildConfig.js';
import { getRecentMovements } from '../supabaseSync.js';
import { fetchClanRoster } from '../clan/wgClient.js';
import { runGuildScan } from '../scheduler.js';
import { error as logError } from '../logger.js';

export const clanCommandDefinition = new SlashCommandBuilder()
  .setName('clan')
  .setDescription('Gestion du suivi des clans World of Tanks')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sub) =>
    sub
      .setName('add')
      .setDescription('Ajoute un clan à la liste suivie')
      .addIntegerOption((opt) => opt.setName('clan_id').setDescription('ID du clan WoT').setRequired(true)),
  )
  .addSubcommand((sub) =>
    sub
      .setName('remove')
      .setDescription('Retire un clan de la liste suivie')
      .addIntegerOption((opt) => opt.setName('clan_id').setDescription('ID du clan WoT').setRequired(true)),
  )
  .addSubcommand((sub) => sub.setName('list').setDescription('Liste les clans suivis'))
  .addSubcommand((sub) =>
    sub
      .setName('channel')
      .setDescription('Définit le salon de notification des mouvements de clan')
      .addChannelOption((opt) =>
        opt
          .setName('salon')
          .setDescription('Salon textuel pour les notifications')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) => sub.setName('scan').setDescription('Force un scan immédiat des clans suivis'))
  .addSubcommand((sub) =>
    sub
      .setName('movements')
      .setDescription('Affiche les derniers mouvements de clan')
      .addIntegerOption((opt) => opt.setName('clan_id').setDescription('Filtrer par ID de clan').setRequired(false))
      .addIntegerOption((opt) =>
        opt.setName('limit').setDescription('Nombre de résultats (max 25)').setRequired(false),
      ),
  );

export async function handleClanCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: 'Cette commande doit être utilisée dans un serveur.', ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();
  await interaction.deferReply({ ephemeral: true });

  try {
    if (sub === 'add') {
      const clanId = interaction.options.getInteger('clan_id', true);
      const roster = await fetchClanRoster(clanId).catch(() => null);
      const cfg = await addTrackedClan(guildId, clanId, roster?.tag ?? null, roster?.name ?? null, interaction.user.id);
      if (!cfg) {
        await interaction.editReply("Échec de l'ajout du clan. Réessaie plus tard.");
        return;
      }
      const label = roster?.tag ? `[${roster.tag}] ${roster.name}` : `#${clanId}`;
      await interaction.editReply(`Clan ${label} ajouté au suivi (${cfg.tracked_clans.length} clan(s) suivi(s)).`);
      return;
    }

    if (sub === 'remove') {
      const clanId = interaction.options.getInteger('clan_id', true);
      const cfg = await removeTrackedClan(guildId, clanId, interaction.user.id);
      if (!cfg) {
        await interaction.editReply('Échec du retrait du clan. Réessaie plus tard.');
        return;
      }
      await interaction.editReply(`Clan #${clanId} retiré du suivi (${cfg.tracked_clans.length} clan(s) suivi(s)).`);
      return;
    }

    if (sub === 'list') {
      const cfg = await refreshGuildConfig(guildId);
      if (cfg.tracked_clans.length === 0) {
        await interaction.editReply('Aucun clan suivi pour le moment. Utilise `/clan add` pour en ajouter un.');
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle('Clans suivis')
        .setDescription(
          cfg.tracked_clans
            .map((c) => `• ${c.clan_tag ? `[${c.clan_tag}] ` : ''}${c.clan_name ?? `Clan #${c.clan_id}`} (\`${c.clan_id}\`)`)
            .join('\n'),
        )
        .setFooter({
          text: `Salon de notification : ${cfg.clan_notify_channel_id ? `#${cfg.clan_notify_channel_id}` : 'non défini'}`,
        });
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (sub === 'channel') {
      const channel = interaction.options.getChannel('salon', true);
      const cfg = await setNotifyChannel(guildId, channel.id, interaction.user.id);
      if (!cfg) {
        await interaction.editReply('Échec de la mise à jour du salon. Réessaie plus tard.');
        return;
      }
      await interaction.editReply(`Salon de notification des mouvements de clan défini sur <#${channel.id}>.`);
      return;
    }

    if (sub === 'scan') {
      const cfg = await getGuildConfig(guildId);
      if (cfg.tracked_clans.length === 0) {
        await interaction.editReply('Aucun clan suivi — rien à scanner.');
        return;
      }
      await runGuildScan(interaction.client, guildId);
      await interaction.editReply(`Scan manuel terminé pour ${cfg.tracked_clans.length} clan(s).`);
      return;
    }

    if (sub === 'movements') {
      const clanId = interaction.options.getInteger('clan_id') ?? undefined;
      const limit = Math.min(interaction.options.getInteger('limit') ?? 10, 25);
      const movements = await getRecentMovements(guildId, limit, clanId);
      if (movements.length === 0) {
        await interaction.editReply('Aucun mouvement enregistré pour le moment.');
        return;
      }
      const embed = new EmbedBuilder().setTitle('Derniers mouvements de clan').setDescription(
        movements
          .map((m) => {
            const icon = m.event === 'join' ? '🟢' : '🔴';
            const label = m.event === 'join' ? 'Entrée' : 'Sortie';
            const clanLabel = m.clan_tag ? `[${m.clan_tag}]` : `Clan #${m.clan_id}`;
            const date = new Date(m.occurred_at).toLocaleString('fr-FR');
            return `${icon} **${label}** — ${m.account_name} (${clanLabel}) — ${date}`;
          })
          .join('\n'),
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }
  } catch (err) {
    logError(`Échec de la commande clan (sub=${sub}):`, err);
    await interaction.editReply('Une erreur est survenue lors du traitement de la commande.');
  }
}
