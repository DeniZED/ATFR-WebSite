import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { config } from '../config.js';
import { error as logError } from '../logger.js';
import { resolveAccount, fetchPlayerClanTag } from '../clan/wgClient.js';
import { getPlayerStats } from '../supabaseSync.js';
import { wn8Color, wn8Label } from '../clan/wn8.js';
import type { PlayerStats } from '../clan/types.js';

function realm(): 'EU' | 'NA' | 'ASIA' {
  const base = config.clanTracker.wgApiBase;
  if (base.includes('worldoftanks.com')) return 'NA';
  if (base.includes('worldoftanks.asia')) return 'ASIA';
  return 'EU';
}

function tomatoProfileUrl(nickname: string): string {
  return `https://tomato.gg/stats/${realm()}/${encodeURIComponent(nickname)}`;
}

// ── /stats ───────────────────────────────────────────────────────────────
export const statsCommandDefinition = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('Affiche les stats World of Tanks d’un joueur (WN8, winrate, batailles…)')
  .addStringOption((opt) =>
    opt
      .setName('pseudo')
      .setDescription(`Pseudo exact du joueur (serveur ${realm()})`)
      .setRequired(true)
      .setMaxLength(64),
  );

function fmtInt(n: number | null): string {
  return n == null ? '—' : Math.round(n).toLocaleString('fr-FR');
}
function fmtPct(n: number | null): string {
  return n == null ? '—' : `${n.toFixed(2)} %`;
}
function fmtNum(n: number | null, digits = 2): string {
  return n == null ? '—' : n.toFixed(digits);
}

function buildStatsEmbed(stats: PlayerStats, clanTag: string | null): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(wn8Color(stats.wn8))
    .setTitle(clanTag ? `[${clanTag}] ${stats.nickname}` : stats.nickname)
    .setURL(tomatoProfileUrl(stats.nickname))
    .addFields(
      {
        name: 'WN8',
        value: stats.wn8 != null ? `**${fmtInt(stats.wn8)}** · ${wn8Label(stats.wn8)}` : '—',
        inline: true,
      },
      { name: 'Winrate', value: fmtPct(stats.winRate), inline: true },
      { name: 'Batailles', value: fmtInt(stats.battles), inline: true },
      { name: 'Dégâts moy.', value: fmtInt(stats.damagePerBattle), inline: true },
      { name: 'Tier moyen', value: fmtNum(stats.avgTier), inline: true },
      { name: 'Chars Tier X', value: fmtInt(stats.tier10Count), inline: true },
    );

  if (stats.recent && (stats.recent.battles ?? 0) > 0) {
    embed.addFields({
      name: '📈 30 derniers jours',
      value:
        `WN8 **${fmtInt(stats.recent.wn8)}** · ` +
        `WR ${fmtPct(stats.recent.winRate)} · ` +
        `${fmtInt(stats.recent.battles)} batailles`,
      inline: false,
    });
  }

  if (stats.lastBattleTime > 0) {
    embed.addFields({ name: 'Dernière bataille', value: `<t:${stats.lastBattleTime}:R>`, inline: true });
  }

  embed.setFooter({ text: 'Données tomato.gg / Wargaming' });
  return embed;
}

export async function handleStatsCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const pseudo = interaction.options.getString('pseudo', true);
  await interaction.deferReply();

  if (!config.clanTracker.wotApplicationId) {
    await interaction.editReply(
      '⚠️ Le bot n’est pas configuré pour interroger l’API Wargaming (`WOT_APPLICATION_ID` manquant).',
    );
    return;
  }

  try {
    const account = await resolveAccount(pseudo);
    if (!account) {
      await interaction.editReply(`❌ Aucun joueur trouvé pour **${pseudo}** sur le serveur ${realm()}.`);
      return;
    }

    const [stats, clanTag] = await Promise.all([
      getPlayerStats(account.accountId),
      fetchPlayerClanTag(account.accountId),
    ]);

    if (!stats) {
      await interaction.editReply(`❌ Impossible de récupérer les stats de **${account.nickname}** pour le moment.`);
      return;
    }

    await interaction.editReply({ embeds: [buildStatsEmbed(stats, clanTag)] });
  } catch (err) {
    logError('Commande /stats:', err);
    await interaction.editReply('❌ Une erreur est survenue en récupérant les stats. Réessaie plus tard.');
  }
}

// ── /ping ────────────────────────────────────────────────────────────────
export const pingCommandDefinition = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Vérifie que le bot répond (latence)');

export async function handlePingCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const sent = await interaction.reply({ content: '🏓 Pong…', fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(
    `🏓 Pong ! Latence : **${latency} ms** · WebSocket : **${Math.round(interaction.client.ws.ping)} ms**`,
  );
}
