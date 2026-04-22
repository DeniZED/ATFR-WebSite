// Fallback-friendly player stats accessor.
//
// The old tomato.gg dev API is now allowlisted and blocks third parties with
// a 403. We now compute WN8 ourselves in a Netlify Function using the
// Wargaming API plus the XVM expected-values table. See
// `netlify/functions/player-stats.mts`.

export interface PlayerExtendedStats {
  accountId: number;
  nickname: string;
  wn8: number | null;
  winRate: number | null;
  battles: number;
  damagePerBattle: number | null;
  tier10Count: number;
  globalRating: number;
  lastBattleTime: number;
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
