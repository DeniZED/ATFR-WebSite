import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  type ChatInputCommandInteraction,
  type ButtonInteraction,
} from 'discord.js';
import { config } from '../config.js';
import { error as logError } from '../logger.js';
import { buildQuizRound, type QuizRound } from '../quiz/round.js';
import { getVehicleDetail } from '../tankopedia/client.js';
import { recordWin, getLeaderboard } from '../quiz/scores.js';
import { getSettings } from '../quiz/settings.js';

const LETTERS = ['A', 'B', 'C', 'D'] as const;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function tierRoman(tier: number): string {
  return ROMAN[tier] ?? String(tier);
}

export const quizCommandDefinition = new SlashCommandBuilder()
  .setName('quiz')
  .setDescription('Quiz « devine le char » World of Tanks')
  .addSubcommand((sub) => sub.setName('play').setDescription('Lance une question'))
  .addSubcommand((sub) => sub.setName('classement').setDescription('Affiche le classement du quiz'));

function questionEmbed(round: QuizRound, imageUrl: string | null, roundSeconds: number): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🎯 Quiz — Quel est ce char ?')
    .setDescription(
      `Indice : **Tier ${tierRoman(round.answer.tier)}**\nClique sur la bonne réponse (⏱️ ${roundSeconds} s).`,
    );
  if (imageUrl) embed.setImage(imageUrl);
  return embed;
}

function resultEmbed(imageUrl: string | null, resultLine: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🎯 Quiz — Quel est ce char ?')
    .setDescription(resultLine);
  if (imageUrl) embed.setImage(imageUrl);
  return embed;
}

function optionsRow(round: QuizRound, opts: { disabled: boolean; answerIndex?: number }): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    round.options.map((o, i) =>
      new ButtonBuilder()
        .setCustomId(`quizopt:${i}`)
        .setLabel(`${LETTERS[i]}. ${o.name}`.slice(0, 80))
        .setStyle(opts.answerIndex === i ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(opts.disabled),
    ),
  );
}

async function handlePlay(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  if (!config.clanTracker.wotApplicationId) {
    await interaction.editReply(
      '⚠️ Le bot n’est pas configuré pour interroger la Tankopedia (`WOT_APPLICATION_ID` manquant).',
    );
    return;
  }

  const settings = getSettings();
  const round = await buildQuizRound(settings.optionCount, settings.minTier);
  if (!round) {
    await interaction.editReply('❌ Impossible de préparer un quiz pour le moment. Réessaie plus tard.');
    return;
  }

  const detail = await getVehicleDetail(round.answer.tankId);
  const imageUrl = detail?.imageUrl ?? null;
  const answerIndex = round.options.findIndex((o) => o.tankId === round.answer.tankId);

  const message = await interaction.editReply({
    embeds: [questionEmbed(round, imageUrl, settings.roundSeconds)],
    components: [optionsRow(round, { disabled: false })],
  });

  const answered = new Set<string>();
  let solved = false;
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: settings.roundSeconds * 1000,
  });

  collector.on('collect', async (btn: ButtonInteraction) => {
    if (answered.has(btn.user.id)) {
      await btn.reply({ content: 'Tu as déjà répondu à ce tour 😉', flags: MessageFlags.Ephemeral }).catch(() => {});
      return;
    }
    answered.add(btn.user.id);

    const picked = Number(btn.customId.split(':')[1]);
    if (picked === answerIndex) {
      solved = true;
      collector.stop('solved');
      const points = recordWin(btn.user.id, btn.user.username);
      await btn
        .update({
          embeds: [
            resultEmbed(
              imageUrl,
              `🏆 <@${btn.user.id}> a trouvé : **${round.answer.name}** !\n+1 point (total : **${points}**)`,
            ),
          ],
          components: [optionsRow(round, { disabled: true, answerIndex })],
        })
        .catch(() => {});
    } else {
      const pickedName = round.options[picked]?.name ?? '?';
      await btn
        .reply({ content: `❌ Raté ! Ce n'est pas **${pickedName}**.`, flags: MessageFlags.Ephemeral })
        .catch(() => {});
    }
  });

  collector.on('end', async () => {
    if (solved) return;
    await interaction
      .editReply({
        embeds: [resultEmbed(imageUrl, `⏱️ Temps écoulé — c'était **${round.answer.name}**.`)],
        components: [optionsRow(round, { disabled: true, answerIndex })],
      })
      .catch(() => {});
  });
}

async function handleLeaderboard(interaction: ChatInputCommandInteraction): Promise<void> {
  const board = getLeaderboard(10);
  if (board.length === 0) {
    await interaction.reply('Aucun score pour le moment. Lance `/quiz play` pour ouvrir le bal ! 🎯');
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  const embed = new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle('🏆 Classement Quiz « devine le char »')
    .setDescription(
      board
        .map((e) => {
          const badge = medals[e.rank - 1] ?? `**${e.rank}.**`;
          return `${badge} ${e.username} — **${e.points}** pt${e.points > 1 ? 's' : ''}`;
        })
        .join('\n'),
    );
  await interaction.reply({ embeds: [embed] });
}

export async function handleQuizCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const sub = interaction.options.getSubcommand();
    if (sub === 'play') return await handlePlay(interaction);
    if (sub === 'classement') return await handleLeaderboard(interaction);
  } catch (err) {
    logError('Commande /quiz:', err);
    const msg = '❌ Une erreur est survenue avec le quiz.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(msg).catch(() => {});
    } else {
      await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
}
