// Player stats accessor — WN8/winrate/avgTier come from tomato.gg's
// bulk-stats API, fetched server-side in `netlify/functions/player-stats.mts`
// (battles/damage/tier10 count come from the Wargaming API). Never computed
// client-side.

export interface PlayerRecentStats {
  battles: number | null;
  winRate: number | null;
  wn8: number | null;
  avgTier: number | null;
}

export interface PlayerExtendedStats {
  accountId: number;
  nickname: string;
  wn8: number | null;
  winRate: number | null;
  battles: number;
  damagePerBattle: number | null;
  avgTier: number | null;
  tier10Count: number;
  globalRating: number;
  lastBattleTime: number;
  recent: PlayerRecentStats | null;
  recruitmentScore: number | null;
  recruitmentThresholds: { minWn8: number; minBattles: number };
  profileUrl: string;
}

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

export function wn8Color(wn8: number | null): string {
  if (wn8 == null) return 'text-atfr-fog';
  if (wn8 < 300) return 'text-neutral-400';
  if (wn8 < 600) return 'text-red-400';
  if (wn8 < 900) return 'text-orange-400';
  if (wn8 < 1250) return 'text-yellow-400';
  if (wn8 < 1600) return 'text-lime-400';
  if (wn8 < 1900) return 'text-emerald-400';
  if (wn8 < 2350) return 'text-cyan-400';
  if (wn8 < 2900) return 'text-indigo-400';
  if (wn8 < 3400) return 'text-fuchsia-400';
  return 'text-pink-300';
}

export function wn8Label(wn8: number | null): string {
  if (wn8 == null) return '—';
  if (wn8 < 300) return 'Très faible';
  if (wn8 < 600) return 'Faible';
  if (wn8 < 900) return 'Moyen -';
  if (wn8 < 1250) return 'Moyen';
  if (wn8 < 1600) return 'Bon';
  if (wn8 < 1900) return 'Très bon';
  if (wn8 < 2350) return 'Excellent';
  if (wn8 < 2900) return 'Unicum';
  if (wn8 < 3400) return 'Super unicum';
  return 'Légendaire';
}
