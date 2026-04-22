// Wrapper autour des stats étendues disponibles sur tomato.gg (WN8, recents).
// L'API publique de tomato.gg n'est pas toujours garantie — on tente un appel
// et on retombe proprement sur null si elle est indisponible ou change de
// format. Le lien direct reste toujours fonctionnel en CTA externe.

const BASE = 'https://api.tomato.gg';

export interface TomatoStats {
  wn8: number | null;
  recentWn8: number | null;
  recentWinRate: number | null;
  tier10Count: number | null;
  profileUrl: string;
}

export function tomatoProfileUrl(nickname: string): string {
  return `https://tomato.gg/stats/EU/${encodeURIComponent(nickname)}`;
}

export async function getTomatoStats(
  accountId: number,
  nickname: string,
): Promise<TomatoStats> {
  const profileUrl = tomatoProfileUrl(nickname);
  try {
    const res = await fetch(`${BASE}/dev/api-v2/player/${accountId}/EU`, {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return emptyStats(profileUrl);
    const json = (await res.json()) as {
      overallStats?: { wn8?: number; winrate?: number };
      recents?: {
        '60days'?: { wn8?: number; winrate?: number };
        '30days'?: { wn8?: number; winrate?: number };
      };
      tankStats?: Array<{ tier?: number }>;
    };

    const tier10Count = json.tankStats
      ? json.tankStats.filter((t) => t.tier === 10).length
      : null;

    const recent = json.recents?.['60days'] ?? json.recents?.['30days'];

    return {
      wn8: json.overallStats?.wn8 ?? null,
      recentWn8: recent?.wn8 ?? null,
      recentWinRate: recent?.winrate ?? null,
      tier10Count,
      profileUrl,
    };
  } catch {
    return emptyStats(profileUrl);
  }
}

function emptyStats(profileUrl: string): TomatoStats {
  return {
    wn8: null,
    recentWn8: null,
    recentWinRate: null,
    tier10Count: null,
    profileUrl,
  };
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
