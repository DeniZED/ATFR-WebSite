import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { config } from '../config.js';
import { error as logError } from '../logger.js';
import { searchVehicle, getVehicleDetail, suggestVehicles, type VehicleDetail } from '../tankopedia/client.js';
import { nationLabel, typeLabel, tierRoman, typeEmoji, typeColor } from '../tankopedia/labels.js';
import { notFoundMessage } from '../tankopedia/search.js';
import {
  renderComparisonTable,
  comparisonVerdict,
  fmtInt as int,
  fmtDec as dec,
  type CompareRow,
} from '../format/compareTable.js';

export const compareCommandDefinition = new SlashCommandBuilder()
  .setName('compare')
  .setDescription('Compare deux chars World of Tanks stat par stat')
  .addStringOption((opt) =>
    opt.setName('char1').setDescription('Premier char').setRequired(true).setMaxLength(64),
  )
  .addStringOption((opt) =>
    opt.setName('char2').setDescription('Second char').setRequired(true).setMaxLength(64),
  );

function dpm(v: VehicleDetail): number | null {
  return v.damage != null && v.fireRate != null ? v.damage * v.fireRate : null;
}

function powerToWeight(v: VehicleDetail): number | null {
  return v.enginePower != null && v.weight != null && v.weight > 0 ? v.enginePower / v.weight : null;
}

function buildRows(a: VehicleDetail, b: VehicleDetail): CompareRow[] {
  return [
    { label: 'Points de vie', a: a.hp, b: b.hp, better: 'high', render: int },
    { label: 'Dégâts (obus)', a: a.damage, b: b.damage, better: 'high', render: int },
    { label: 'DPM théorique', a: dpm(a), b: dpm(b), better: 'high', render: int },
    { label: 'Pénétration', a: a.penetration, b: b.penetration, better: 'high', render: (n) => `${int(n)} mm` },
    { label: 'Cadence (c/min)', a: a.fireRate, b: b.fireRate, better: 'high', render: dec(2) },
    { label: 'Visée (s)', a: a.aimTime, b: b.aimTime, better: 'low', render: dec(2) },
    { label: 'Dispersion (m)', a: a.dispersion, b: b.dispersion, better: 'low', render: dec(2) },
    { label: 'Vitesse (km/h)', a: a.speedForward, b: b.speedForward, better: 'high', render: int },
    { label: 'Moteur (ch)', a: a.enginePower, b: b.enginePower, better: 'high', render: int },
    { label: 'Puiss./poids', a: powerToWeight(a), b: powerToWeight(b), better: 'high', render: dec(1) },
    { label: 'Portée de vue (m)', a: a.viewRange, b: b.viewRange, better: 'high', render: int },
  ];
}

function identity(letter: 'A' | 'B', v: VehicleDetail): string {
  const premium = v.isPremium ? ' ⭐' : '';
  return `**${letter} · ${typeEmoji(v.type)} ${v.name}${premium}** — Tier ${tierRoman(v.tier)} · ${nationLabel(v.nation)} · ${typeLabel(v.type)}`;
}

export async function handleCompareCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const q1 = interaction.options.getString('char1', true);
  const q2 = interaction.options.getString('char2', true);
  await interaction.deferReply();

  if (!config.clanTracker.wotApplicationId) {
    await interaction.editReply(
      '⚠️ Le bot n’est pas configuré pour interroger la Tankopedia (`WOT_APPLICATION_ID` manquant).',
    );
    return;
  }

  try {
    const [m1, m2] = await Promise.all([searchVehicle(q1), searchVehicle(q2)]);
    if (!m1) {
      await interaction.editReply(notFoundMessage(q1, await suggestVehicles(q1, 3)));
      return;
    }
    if (!m2) {
      await interaction.editReply(notFoundMessage(q2, await suggestVehicles(q2, 3)));
      return;
    }
    if (m1.best.tankId === m2.best.tankId) {
      await interaction.editReply('❌ Choisis deux chars différents à comparer.');
      return;
    }

    const [a, b] = await Promise.all([getVehicleDetail(m1.best.tankId), getVehicleDetail(m2.best.tankId)]);
    if (!a || !b) {
      await interaction.editReply('❌ Impossible de récupérer la fiche d’un des deux chars.');
      return;
    }

    const rows = buildRows(a, b);
    const { table, aWins, bWins } = renderComparisonTable(rows);

    const parts = [identity('A', a), identity('B', b)];
    if (a.tier !== b.tier) {
      parts.push(`⚠️ Tiers différents (${tierRoman(a.tier)} vs ${tierRoman(b.tier)}) — comparaison indicative.`);
    }
    parts.push('```' + table + '```');
    parts.push(comparisonVerdict(a.name, b.name, aWins, bWins, 'caractéristique(s)'));

    const winnerColor = aWins > bWins ? typeColor(a.type) : bWins > aWins ? typeColor(b.type) : 0x5865f2;
    const embed = new EmbedBuilder()
      .setColor(winnerColor)
      .setTitle(`⚔️ ${a.name}  vs  ${b.name}`)
      .setDescription(parts.join('\n\n').slice(0, 4096))
      .setFooter({ text: 'ATFR • Tankopedia — ◀ / ▶ indiquent le vainqueur de chaque ligne' });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    logError('Commande /compare:', err);
    await interaction.editReply('❌ Une erreur est survenue pendant la comparaison. Réessaie plus tard.');
  }
}
