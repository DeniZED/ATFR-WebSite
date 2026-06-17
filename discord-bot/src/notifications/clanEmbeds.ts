import { EmbedBuilder, type APIEmbedField } from 'discord.js';
import type { MovementEvent } from '../clan/types.js';

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
}

export function buildClanMovementEmbed(input: ClanMovementEmbedInput): EmbedBuilder {
  const isJoin = input.event === 'join';
  const clanLabel = input.clanTag ? `[${input.clanTag}]` : input.clanName ?? 'Clan inconnu';

  const fields: APIEmbedField[] = [
    { name: 'Clan', value: clanLabel, inline: true },
    { name: 'Joueur', value: input.accountName, inline: true },
    { name: 'Mouvement', value: isJoin ? '🟢 Entrée' : '🔴 Sortie', inline: true },
  ];
  if (input.role) fields.push({ name: 'Rôle', value: input.role, inline: true });

  return new EmbedBuilder()
    .setTitle(isJoin ? '📥 Nouveau membre' : '📤 Départ de membre')
    .setColor(isJoin ? JOIN_COLOR : LEAVE_COLOR)
    .addFields(fields)
    .setFooter({ text: `ID joueur : ${input.accountId}` })
    .setTimestamp(input.occurredAt);
}
