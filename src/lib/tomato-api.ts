// Player stats accessor — WN8/winrate/avgTier come from tomato.gg's
// bulk-stats API, fetched server-side in `netlify/functions/player-stats.mts`
// (battles/damage/tier10 count come from the Wargaming API). Never computed
// client-side. The wire contract lives in `src/types/playerStats.ts`.

import type { PlayerStatsPayload, PlayerRecentStats } from '@/types/playerStats';
import { WN8_TIERS, wn8TierIndex } from '@/lib/wn8-scale';

export type { PlayerRecentStats };

/** Payload de la fonction player-stats + décoration client (lien tomato.gg). */
export type PlayerExtendedStats = PlayerStatsPayload & { profileUrl: string };

export function tomatoProfileUrl(nickname: string): string {
  return `https://tomato.gg/stats/EU/${encodeURIComponent(nickname)}`;
}

export async function getPlayerExtendedStats(
  accountId: number,
  nickname: string,
): Promise<PlayerExtendedStats | null> {
  try {
    const res = await fetch(
      `/.netlify/functions/player-stats?account_id=${accountId}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Omit<PlayerExtendedStats, 'profileUrl'>;
    return { ...data, profileUrl: tomatoProfileUrl(nickname) };
  } catch {
    return null;
  }
}

/** Récupère les stats de plusieurs joueurs en un seul appel (filtre Mouvements). */
export async function getPlayerExtendedStatsBatch(
  accountIds: number[],
  nicknameByAccountId: Map<number, string>,
): Promise<Map<number, PlayerExtendedStats>> {
  const result = new Map<number, PlayerExtendedStats>();
  if (accountIds.length === 0) return result;
  try {
    const res = await fetch(
      `/.netlify/functions/player-stats?account_ids=${accountIds.join(',')}`,
    );
    if (!res.ok) return result;
    const data = (await res.json()) as { players: Omit<PlayerExtendedStats, 'profileUrl'>[] };
    for (const player of data.players) {
      const nickname = nicknameByAccountId.get(player.accountId) ?? player.nickname;
      result.set(player.accountId, { ...player, profileUrl: tomatoProfileUrl(nickname) });
    }
    return result;
  } catch {
    return result;
  }
}

// Couleurs Tailwind par palier, alignées index par index sur WN8_TIERS.
const WN8_TIER_COLORS: readonly string[] = [
  'text-neutral-400',
  'text-red-400',
  'text-orange-400',
  'text-yellow-400',
  'text-lime-400',
  'text-emerald-400',
  'text-cyan-400',
  'text-indigo-400',
  'text-fuchsia-400',
  'text-pink-300',
];

export function wn8Color(wn8: number | null): string {
  if (wn8 == null) return 'text-atfr-fog';
  return WN8_TIER_COLORS[wn8TierIndex(wn8)];
}

export function wn8Label(wn8: number | null): string {
  if (wn8 == null) return '—';
  return WN8_TIERS[wn8TierIndex(wn8)].label;
}
