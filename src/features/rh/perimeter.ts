import type { PlayerRow } from '@/types/database';
import type { PlayerActivitySummary } from './activity';

/**
 * Périmètre RH — sépare clairement les populations pour ne pas laisser les
 * anciens membres ni les prospects fausser les stats principales du clan.
 *
 * Mapping (basé sur players.status) :
 *   - Membre actuel  : status ∈ {active, low_activity, inactive, watch}
 *   - Prospect       : status = prospect
 *   - Ancien membre  : status = former
 */
export type RhScope = 'current' | 'prospects' | 'former' | 'all';
export type PlayerCategory = 'current' | 'prospect' | 'former';

export const RH_SCOPE_LABELS: Record<RhScope, string> = {
  current: 'Membres actuels',
  prospects: 'Prospects',
  former: 'Anciens membres',
  all: 'Tous les joueurs suivis',
};

export const RH_SCOPES: RhScope[] = ['current', 'prospects', 'former', 'all'];

export function classifyPlayer(
  player: Pick<PlayerRow, 'status'>,
): PlayerCategory {
  if (player.status === 'former') return 'former';
  if (player.status === 'prospect') return 'prospect';
  return 'current';
}

export function matchesScope(category: PlayerCategory, scope: RhScope): boolean {
  if (scope === 'all') return true;
  if (scope === 'current') return category === 'current';
  if (scope === 'prospects') return category === 'prospect';
  return category === 'former';
}

/** Joueur suivi manuellement : ajouté à la main, sans compte WoT lié. */
export function isManuallyTracked(
  player: Pick<PlayerRow, 'account_id'>,
): boolean {
  return !player.account_id;
}

export function filterByScope(
  players: PlayerActivitySummary[],
  scope: RhScope,
): PlayerActivitySummary[] {
  return players.filter((s) => matchesScope(classifyPlayer(s.player), scope));
}
