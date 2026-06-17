import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { getTodayStats } from '../voice/history.js';

export const voiceCommandDefinition = new SlashCommandBuilder()
  .setName('voice')
  .setDescription("Statistiques d'activité vocale")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sub) => sub.setName('stats').setDescription('Affiche les statistiques vocales du jour'));

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`;
  return `${m}min`;
}

export async function handleVoiceCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  if (sub !== 'stats') return;

  await interaction.deferReply({ ephemeral: true });
  const stats = getTodayStats();

  if (stats.players.length === 0) {
    await interaction.editReply(`Aucune activité vocale enregistrée aujourd'hui (${stats.date}).`);
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`Activité vocale du ${stats.date}`)
    .setDescription(
      stats.players
        .slice(0, 15)
        .map((p) => `${p.stillConnected ? '🟢' : '⚪'} **${p.username}** — ${formatDuration(p.seconds)}`)
        .join('\n'),
    )
    .setFooter({
      text: `${stats.activeNow} connecté(s) actuellement · Total cumulé : ${formatDuration(stats.totalSeconds)}`,
    });

  await interaction.editReply({ embeds: [embed] });
}
