import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { config } from '../config.js';
import { error as logError } from '../logger.js';
import { resolveClanInput, fetchClanInfo, type ClanInfo } from '../clan/wgClient.js';

const DEFAULT_CLAN = 'ATFR';

// Rôles « réguliers » exclus de l'état-major affiché.
const REGULAR_ROLES = new Set(['private', 'recruit', 'reservist']);

export const clanInfoCommandDefinition = new SlashCommandBuilder()
  .setName('clan-info')
  .setDescription('Affiche la fiche d’un clan World of Tanks (par défaut ATFR)')
  .addStringOption((opt) =>
    opt
      .setName('clan')
      .setDescription('Tag ou ID du clan (par défaut : ATFR)')
      .setRequired(false)
      .setMaxLength(32),
  );

function portalUrl(clanId: number): string {
  const base = config.clanTracker.wgApiBase;
  const sub = base.includes('worldoftanks.com') ? 'na' : base.includes('worldoftanks.asia') ? 'asia' : 'eu';
  return `https://${sub}.wargaming.net/clans/wot/${clanId}/`;
}

function parseColor(color: string | null): number {
  if (color && /^#?[0-9a-fA-F]{6}$/.test(color)) {
    return parseInt(color.replace('#', ''), 16);
  }
  return 0x5865f2;
}

function staffLines(info: ClanInfo): string {
  const staff = info.members.filter((m) => m.role && !REGULAR_ROLES.has(m.role));
  if (staff.length === 0) return '—';
  const lines = staff.slice(0, 15).map((m) => `• **${m.name}**${m.roleLabel ? ` — ${m.roleLabel}` : ''}`);
  if (staff.length > 15) lines.push(`… +${staff.length - 15} autres`);
  return lines.join('\n');
}

function buildClanEmbed(info: ClanInfo): EmbedBuilder {
  const title = info.tag ? `[${info.tag}] ${info.name ?? ''}`.trim() : (info.name ?? 'Clan');
  const embed = new EmbedBuilder()
    .setColor(parseColor(info.color))
    .setTitle(title)
    .setURL(portalUrl(info.clanId));

  if (info.motto) embed.setDescription(`_${info.motto}_`);
  if (info.emblemUrl) embed.setThumbnail(info.emblemUrl);

  embed.addFields(
    { name: '👥 Effectif', value: `${info.membersCount} membre${info.membersCount > 1 ? 's' : ''}`, inline: true },
    { name: '👑 Chef', value: info.leaderName ?? '—', inline: true },
  );
  if (info.createdAt) {
    embed.addFields({ name: '📅 Créé le', value: `<t:${info.createdAt}:D>`, inline: true });
  }
  embed.addFields({ name: '🎖️ État-major', value: staffLines(info).slice(0, 1024), inline: false });

  embed.setFooter({ text: `ATFR • Clan #${info.clanId}` });
  return embed;
}

export async function handleClanInfoCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const input = interaction.options.getString('clan') ?? DEFAULT_CLAN;
  await interaction.deferReply();

  if (!config.clanTracker.wotApplicationId) {
    await interaction.editReply(
      '⚠️ Le bot n’est pas configuré pour interroger l’API Wargaming (`WOT_APPLICATION_ID` manquant).',
    );
    return;
  }

  try {
    const resolved = await resolveClanInput(input);
    if (!resolved) {
      await interaction.editReply(`❌ Aucun clan trouvé pour **${input}**.`);
      return;
    }

    const info = await fetchClanInfo(resolved.clanId);
    if (!info) {
      await interaction.editReply(`❌ Impossible de récupérer la fiche du clan **${input}**.`);
      return;
    }

    await interaction.editReply({ embeds: [buildClanEmbed(info)] });
  } catch (err) {
    logError('Commande /clan-info:', err);
    await interaction.editReply('❌ Une erreur est survenue en récupérant le clan. Réessaie plus tard.');
  }
}
