import { EmbedBuilder, type APIEmbedField } from 'discord.js';
import type { MovementEvent, PlayerStats } from '../clan/types.js';
import { wn8Color, wn8Label } from '../clan/wn8.js';

const JOIN_COLOR = 0x57f287;
const LEAVE_COLOR = 0xed4245;

export interface ClanMovementEmbedInput {
  clanTag: string | null;
  clanName: string | null;
  accountId: number;
  accountName: string;
  role: string | null;
  event: MovementEvent;
  occurredAt: Date;
  stats: PlayerStats | null;
}

function tomatoProfileUrl(nickname: string): string {
  return `https://tomato.gg/stats/EU/${encodeURIComponent(nickname)}`;
}

function fmt(value: number | null, decimals = 0): string {
  if (value == null) return '—';
  return value.toLocaleString('fr-FR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function globalAnd30j(global: number | null, recent: number | null, decimals = 0): string {
  const g = fmt(global, decimals);
  const r = recent != null ? fmt(recent, decimals) : '—';
  return `${g} *(30j : ${r})*`;
}

export function buildClanMovementEmbed(input: ClanMovementEmbedInput): EmbedBuilder {
  const isJoin = input.event === 'join';
  const clanLabel = input.clanTag ? `[${input.clanTag}]` : input.clanName ?? 'Clan inconnu';
  const stats = input.stats;

  const fields: APIEmbedField[] = [
    { name: 'Clan', value: clanLabel, inline: true },
    { name: 'Mouvement', value: isJoin ? '🟢 Entrée' : '🔴 Sortie', inline: true },
  ];
  if (input.role) fields.push({ name: 'Rôle', value: input.role, inline: true });

  if (stats) {
    fields.push(
      {
        name: 'Score de recrutement',
        value: stats.recruitmentScore != null ? `${stats.recruitmentScore}/100` : '—',
        inline: true,
      },
      { name: 'WN8 (global / 30j)', value: globalAnd30j(stats.wn8, stats.recent?.wn8 ?? null), inline: true },
      {
        name: 'Batailles (global / 30j)',
        value: globalAnd30j(stats.battles, stats.recent?.battles ?? null),
        inline: true,
      },
      {
        name: 'Winrate (global / 30j)',
        value: globalAnd30j(stats.winRate, stats.recent?.winRate ?? null, 1) + ' %',
        inline: true,
      },
      {
        name: 'Tier moyen (global / 30j)',
        value: globalAnd30j(stats.avgTier, stats.recent?.avgTier ?? null, 1),
        inline: true,
      },
      { name: 'Dégâts moy. (global)', value: fmt(stats.damagePerBattle), inline: true },
      { name: 'Chars Tier X', value: String(stats.tier10Count), inline: true },
      { name: 'Statut recrutement', value: 'Nouveau', inline: true },
      { name: 'Profil Tomato.gg', value: `[Voir le profil](${tomatoProfileUrl(stats.nickname)})`, inline: true },
    );
  } else {
    fields.push({ name: 'Stats', value: 'Indisponibles pour le moment', inline: false });
  }

  const embed = new EmbedBuilder()
    .setTitle(`${isJoin ? '📥' : '📤'} ${input.accountName}`)
    .setDescription(
      stats
        ? `${wn8Label(stats.wn8)} — ${isJoin ? 'a rejoint le clan' : 'a quitté le clan'}`
        : isJoin
          ? 'Nouveau membre'
          : 'Départ de membre',
    )
    .setColor(stats ? wn8Color(stats.wn8) : isJoin ? JOIN_COLOR : LEAVE_COLOR)
    .addFields(fields)
    .setFooter({ text: `ID joueur : ${input.accountId}` })
    .setTimestamp(input.occurredAt);

  return embed;
}
