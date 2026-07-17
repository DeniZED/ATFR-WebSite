import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { error as logError } from '../logger.js';
import {
  resetAll,
  setPoints,
  addPoints,
  removeUser,
  getLeaderboard,
  scoreCount,
} from '../quiz/scores.js';
import { getSettings, updateSettings, LIMITS } from '../quiz/settings.js';

export const quizAdminCommandDefinition = new SlashCommandBuilder()
  .setName('quiz-admin')
  .setDescription('Gestion du quiz (réservé aux admins)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sub) => sub.setName('reset').setDescription('Remet tout le classement à zéro (confirmation requise)'))
  .addSubcommand((sub) =>
    sub
      .setName('set')
      .setDescription("Définit le nombre de points d'un joueur")
      .addUserOption((o) => o.setName('joueur').setDescription('Le joueur à modifier').setRequired(true))
      .addIntegerOption((o) =>
        o.setName('points').setDescription('Nouveau total de points (≥ 0)').setRequired(true).setMinValue(0),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('add')
      .setDescription("Ajuste les points d'un joueur (valeur négative pour retirer)")
      .addUserOption((o) => o.setName('joueur').setDescription('Le joueur à ajuster').setRequired(true))
      .addIntegerOption((o) =>
        o.setName('delta').setDescription('Points à ajouter (ou retirer si négatif)').setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('remove')
      .setDescription('Retire un joueur du classement')
      .addUserOption((o) => o.setName('joueur').setDescription('Le joueur à retirer').setRequired(true)),
  )
  .addSubcommand((sub) =>
    sub
      .setName('list')
      .setDescription('Affiche le classement complet')
      .addIntegerOption((o) =>
        o.setName('limite').setDescription('Nombre de joueurs à afficher (défaut 50)').setMinValue(1).setMaxValue(100),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('settings')
      .setDescription('Affiche ou modifie les réglages du jeu (sans option = affichage)')
      .addIntegerOption((o) =>
        o
          .setName('duree')
          .setDescription(`Durée d'un tour en secondes (${LIMITS.roundSeconds.min}–${LIMITS.roundSeconds.max})`)
          .setMinValue(LIMITS.roundSeconds.min)
          .setMaxValue(LIMITS.roundSeconds.max),
      )
      .addIntegerOption((o) =>
        o
          .setName('tier_min')
          .setDescription(`Tier minimum des chars (${LIMITS.minTier.min}–${LIMITS.minTier.max})`)
          .setMinValue(LIMITS.minTier.min)
          .setMaxValue(LIMITS.minTier.max),
      )
      .addIntegerOption((o) =>
        o
          .setName('reponses')
          .setDescription(`Nombre de réponses proposées (${LIMITS.optionCount.min}–${LIMITS.optionCount.max})`)
          .setMinValue(LIMITS.optionCount.min)
          .setMaxValue(LIMITS.optionCount.max),
      ),
  );

async function handleReset(interaction: ChatInputCommandInteraction): Promise<void> {
  const count = scoreCount();
  if (count === 0) {
    await interaction.reply({ content: 'Le classement est déjà vide.', flags: MessageFlags.Ephemeral });
    return;
  }

  const confirmId = `quizreset:confirm:${interaction.id}`;
  const cancelId = `quizreset:cancel:${interaction.id}`;
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(confirmId).setLabel(`Réinitialiser (${count})`).setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(cancelId).setLabel('Annuler').setStyle(ButtonStyle.Secondary),
  );

  const message = await interaction.reply({
    content: `⚠️ Confirmer la remise à zéro du classement ? **${count}** joueur(s) seront effacés. Action irréversible.`,
    components: [row],
    flags: MessageFlags.Ephemeral,
    withResponse: true,
  });

  try {
    const btn = await message.resource!.message!.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 15_000,
      filter: (i) => i.user.id === interaction.user.id,
    });
    if (btn.customId === confirmId) {
      const removed = resetAll();
      await btn.update({ content: `🗑️ Classement réinitialisé — **${removed}** joueur(s) effacé(s).`, components: [] });
    } else {
      await btn.update({ content: 'Annulé — le classement est intact.', components: [] });
    }
  } catch {
    await interaction.editReply({ content: '⏱️ Confirmation expirée — rien n’a été modifié.', components: [] }).catch(() => {});
  }
}

async function handleSet(interaction: ChatInputCommandInteraction): Promise<void> {
  const user = interaction.options.getUser('joueur', true);
  const points = interaction.options.getInteger('points', true);
  const total = setPoints(user.id, user.username, points);
  await interaction.reply(`✅ Score de <@${user.id}> défini à **${total}** point${total > 1 ? 's' : ''}.`);
}

async function handleAdd(interaction: ChatInputCommandInteraction): Promise<void> {
  const user = interaction.options.getUser('joueur', true);
  const delta = interaction.options.getInteger('delta', true);
  const total = addPoints(user.id, user.username, delta);
  const sign = delta >= 0 ? `+${delta}` : `${delta}`;
  await interaction.reply(`✅ ${sign} pour <@${user.id}> → nouveau total : **${total}** point${total > 1 ? 's' : ''}.`);
}

async function handleRemove(interaction: ChatInputCommandInteraction): Promise<void> {
  const user = interaction.options.getUser('joueur', true);
  const existed = removeUser(user.id);
  await interaction.reply(
    existed
      ? `🗑️ <@${user.id}> a été retiré du classement.`
      : `<@${user.id}> n'était pas dans le classement.`,
  );
}

async function handleList(interaction: ChatInputCommandInteraction): Promise<void> {
  const limit = interaction.options.getInteger('limite') ?? 50;
  const board = getLeaderboard(limit);
  if (board.length === 0) {
    await interaction.reply({ content: 'Aucun score pour le moment.', flags: MessageFlags.Ephemeral });
    return;
  }
  const lines = board.map((e) => `**${e.rank}.** ${e.username} — ${e.points} pt${e.points > 1 ? 's' : ''}`);
  const embed = new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle(`🏆 Classement complet (${scoreCount()} joueur${scoreCount() > 1 ? 's' : ''})`)
    .setDescription(lines.join('\n').slice(0, 4096));
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

async function handleSettings(interaction: ChatInputCommandInteraction): Promise<void> {
  const duree = interaction.options.getInteger('duree');
  const tierMin = interaction.options.getInteger('tier_min');
  const reponses = interaction.options.getInteger('reponses');

  const hasPatch = duree != null || tierMin != null || reponses != null;
  const settings = hasPatch
    ? updateSettings({
        ...(duree != null ? { roundSeconds: duree } : {}),
        ...(tierMin != null ? { minTier: tierMin } : {}),
        ...(reponses != null ? { optionCount: reponses } : {}),
      })
    : getSettings();

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('⚙️ Réglages du quiz')
    .setDescription(hasPatch ? 'Réglages mis à jour ✅' : 'Réglages actuels')
    .addFields(
      { name: 'Durée d’un tour', value: `${settings.roundSeconds} s`, inline: true },
      { name: 'Tier minimum', value: `${settings.minTier}`, inline: true },
      { name: 'Réponses proposées', value: `${settings.optionCount}`, inline: true },
    );
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

export async function handleQuizAdminCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    switch (interaction.options.getSubcommand()) {
      case 'reset':
        return await handleReset(interaction);
      case 'set':
        return await handleSet(interaction);
      case 'add':
        return await handleAdd(interaction);
      case 'remove':
        return await handleRemove(interaction);
      case 'list':
        return await handleList(interaction);
      case 'settings':
        return await handleSettings(interaction);
    }
  } catch (err) {
    logError('Commande /quiz-admin:', err);
    const msg = '❌ Une erreur est survenue.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(msg).catch(() => {});
    } else {
      await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
}
