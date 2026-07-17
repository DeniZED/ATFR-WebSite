import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { config } from '../config.js';
import { error as logError } from '../logger.js';
import { resolveAccount, fetchPlayerClanTag } from '../clan/wgClient.js';
import { getPlayerStats } from '../supabaseSync.js';
import { wn8Color } from '../clan/wn8.js';
import type { PlayerStats } from '../clan/types.js';
import {
  renderComparisonTable,
  comparisonVerdict,
  fmtInt,
  fmtDec,
  type CompareRow,
} from '../format/compareTable.js';

export const versusCommandDefinition = new SlashCommandBuilder()
  .setName('versus')
  .setDescription('Duel de stats entre deux joueurs World of Tanks')
  .addStringOption((opt) =>
    opt.setName('joueur1').setDescription('Pseudo du premier joueur').setRequired(true).setMaxLength(64),
  )
  .addStringOption((opt) =>
    opt.setName('joueur2').setDescription('Pseudo du second joueur').setRequired(true).setMaxLength(64),
  );

const pct = (n: number) => `${n.toFixed(2)} %`;

function buildRows(a: PlayerStats, b: PlayerStats): CompareRow[] {
  return [
    { label: 'WN8', a: a.wn8, b: b.wn8, better: 'high', render: fmtInt },
    { label: 'Winrate', a: a.winRate, b: b.winRate, better: 'high', render: pct },
    { label: 'Batailles', a: a.battles, b: b.battles, better: 'high', render: fmtInt },
    { label: 'Dégâts moy.', a: a.damagePerBattle, b: b.damagePerBattle, better: 'high', render: fmtInt },
    { label: 'Tier moyen', a: a.avgTier, b: b.avgTier, better: 'high', render: fmtDec(2) },
    { label: 'Chars Tier X', a: a.tier10Count, b: b.tier10Count, better: 'high', render: fmtInt },
    { label: 'WN8 (30j)', a: a.recent?.wn8 ?? null, b: b.recent?.wn8 ?? null, better: 'high', render: fmtInt },
    {
      label: 'Winrate (30j)',
      a: a.recent?.winRate ?? null,
      b: b.recent?.winRate ?? null,
      better: 'high',
      render: pct,
    },
  ];
}

function identity(letter: 'A' | 'B', stats: PlayerStats, clanTag: string | null): string {
  const tag = clanTag ? `[${clanTag}] ` : '';
  return `**${letter} · ${tag}${stats.nickname}**`;
}

export async function handleVersusCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const p1 = interaction.options.getString('joueur1', true);
  const p2 = interaction.options.getString('joueur2', true);
  await interaction.deferReply();

  if (!config.clanTracker.wotApplicationId) {
    await interaction.editReply(
      '⚠️ Le bot n’est pas configuré pour interroger l’API Wargaming (`WOT_APPLICATION_ID` manquant).',
    );
    return;
  }

  try {
    const [a1, a2] = await Promise.all([resolveAccount(p1), resolveAccount(p2)]);
    if (!a1) {
      await interaction.editReply(`❌ Joueur introuvable : **${p1}**.`);
      return;
    }
    if (!a2) {
      await interaction.editReply(`❌ Joueur introuvable : **${p2}**.`);
      return;
    }
    if (a1.accountId === a2.accountId) {
      await interaction.editReply('❌ Choisis deux joueurs différents.');
      return;
    }

    const [s1, s2, tag1, tag2] = await Promise.all([
      getPlayerStats(a1.accountId),
      getPlayerStats(a2.accountId),
      fetchPlayerClanTag(a1.accountId),
      fetchPlayerClanTag(a2.accountId),
    ]);
    if (!s1 || !s2) {
      await interaction.editReply('❌ Impossible de récupérer les stats d’un des deux joueurs.');
      return;
    }

    const rows = buildRows(s1, s2);
    const { table, aWins, bWins } = renderComparisonTable(rows);

    const parts = [
      identity('A', s1, tag1),
      identity('B', s2, tag2),
      '```' + table + '```',
      comparisonVerdict(s1.nickname, s2.nickname, aWins, bWins, 'stat(s)'),
    ];

    const winnerWn8 = aWins >= bWins ? s1.wn8 : s2.wn8;
    const embed = new EmbedBuilder()
      .setColor(wn8Color(winnerWn8))
      .setTitle(`⚔️ ${s1.nickname}  vs  ${s2.nickname}`)
      .setDescription(parts.join('\n\n').slice(0, 4096))
      .setFooter({ text: 'ATFR • données tomato.gg / Wargaming — ◀ / ▶ = vainqueur de la ligne' });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    logError('Commande /versus:', err);
    await interaction.editReply('❌ Une erreur est survenue pendant le duel. Réessaie plus tard.');
  }
}
