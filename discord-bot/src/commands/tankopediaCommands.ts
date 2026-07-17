import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { config } from '../config.js';
import { error as logError } from '../logger.js';
import {
  searchVehicle,
  getVehicleDetail,
  type VehicleSummary,
  type VehicleDetail,
} from '../tankopedia/client.js';

export const charCommandDefinition = new SlashCommandBuilder()
  .setName('char')
  .setDescription('Affiche la fiche d’un char World of Tanks (Tankopedia)')
  .addStringOption((opt) =>
    opt
      .setName('nom')
      .setDescription('Nom du char (ex : Tiger II, Bat.-Châtillon 25 t, IS-7)')
      .setRequired(true)
      .setMaxLength(64),
  );

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const NATION_LABELS: Record<string, string> = {
  ussr: '🇷🇺 URSS',
  germany: '🇩🇪 Allemagne',
  usa: '🇺🇸 États-Unis',
  france: '🇫🇷 France',
  uk: '🇬🇧 Royaume-Uni',
  china: '🇨🇳 Chine',
  japan: '🇯🇵 Japon',
  czech: '🇨🇿 Tchécoslovaquie',
  sweden: '🇸🇪 Suède',
  poland: '🇵🇱 Pologne',
  italy: '🇮🇹 Italie',
};

const TYPE_LABELS: Record<string, string> = {
  lightTank: '🏎️ Char léger',
  mediumTank: '⚙️ Char moyen',
  heavyTank: '🛡️ Char lourd',
  'AT-SPG': '🎯 Chasseur de chars',
  SPG: '💥 Artillerie',
};

function nationLabel(nation: string): string {
  return NATION_LABELS[nation] ?? nation;
}

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

function tierRoman(tier: number): string {
  return ROMAN[tier] ?? String(tier);
}

function fmt(n: number | null, unit = '', digits = 0): string {
  if (n == null) return '—';
  const value = digits > 0 ? n.toFixed(digits) : Math.round(n).toLocaleString('fr-FR');
  return unit ? `${value} ${unit}` : value;
}

function altLabel(v: VehicleSummary): string {
  return `${v.name} (${tierRoman(v.tier)})`;
}

function buildCharEmbed(v: VehicleDetail, alternatives: VehicleSummary[]): EmbedBuilder {
  const premium = v.isPremium ? ' ⭐' : '';
  const embed = new EmbedBuilder()
    .setColor(v.isPremium ? 0xe6b800 : 0x8899a6)
    .setTitle(`${v.name}${premium}`)
    .setDescription(`**Tier ${tierRoman(v.tier)}** · ${nationLabel(v.nation)} · ${typeLabel(v.type)}`)
    .addFields(
      { name: '❤️ Points de vie', value: fmt(v.hp, 'PV'), inline: true },
      { name: '💥 Dégâts (obus)', value: fmt(v.damage), inline: true },
      { name: '🎯 Pénétration', value: fmt(v.penetration, 'mm'), inline: true },
      { name: '🔁 Cadence', value: fmt(v.fireRate, 'c/min', 2), inline: true },
      { name: '⏱️ Visée', value: fmt(v.aimTime, 's', 2), inline: true },
      { name: '📐 Dispersion', value: fmt(v.dispersion, 'm', 2), inline: true },
      { name: '🏎️ Vitesse max', value: fmt(v.speedForward, 'km/h'), inline: true },
      { name: '⚙️ Moteur', value: fmt(v.enginePower, 'ch'), inline: true },
      { name: '👁️ Vue', value: fmt(v.viewRange, 'm'), inline: true },
    );

  if (v.imageUrl) embed.setThumbnail(v.imageUrl);
  if (v.gunName) embed.addFields({ name: '🔫 Canon', value: v.gunName, inline: false });

  if (v.description) {
    const desc = v.description.length > 300 ? `${v.description.slice(0, 297)}…` : v.description;
    embed.addFields({ name: '​', value: `_${desc}_`, inline: false });
  }

  const footerBits = ['ATFR • Tankopedia'];
  if (alternatives.length > 0) {
    footerBits.push(`Autres résultats : ${alternatives.map(altLabel).join(', ')}`);
  }
  embed.setFooter({ text: footerBits.join(' — ').slice(0, 2048) });

  return embed;
}

export async function handleCharCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const nom = interaction.options.getString('nom', true);
  await interaction.deferReply();

  if (!config.clanTracker.wotApplicationId) {
    await interaction.editReply(
      '⚠️ Le bot n’est pas configuré pour interroger la Tankopedia (`WOT_APPLICATION_ID` manquant).',
    );
    return;
  }

  try {
    const match = await searchVehicle(nom);
    if (!match) {
      await interaction.editReply(`❌ Aucun char trouvé pour **${nom}**.`);
      return;
    }

    const detail = await getVehicleDetail(match.best.tankId);
    if (!detail) {
      await interaction.editReply(`❌ Impossible de récupérer la fiche de **${match.best.name}**.`);
      return;
    }

    await interaction.editReply({ embeds: [buildCharEmbed(detail, match.alternatives)] });
  } catch (err) {
    logError('Commande /char:', err);
    await interaction.editReply('❌ Une erreur est survenue en interrogeant la Tankopedia. Réessaie plus tard.');
  }
}
