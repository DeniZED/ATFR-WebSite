import { useQuery } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { getClanInfo, getPlayerStats, searchPlayer } from '@/lib/wot-api';
import { getTomatoStats } from '@/lib/tomato-api';

export interface ClanStats {
  membersCount: number;
  avgWinRate: number | null;
  avgGlobalRating: number | null;
  avgWn8: number | null;
  topPlayers: Array<{
    accountId: number;
    nickname: string;
    role: string;
    wn8: number | null;
    winRate: number | null;
    globalRating: number;
  }>;
}

export function useClanStats(clanId: string = env.clanId) {
  return useQuery({
    queryKey: ['stats', 'clan', clanId],
    queryFn: async (): Promise<ClanStats> => {
      const clan = await getClanInfo(clanId);
      if (!clan) {
        return {
          membersCount: 0,
          avgWinRate: null,
          avgGlobalRating: null,
          avgWn8: null,
          topPlayers: [],
        };
      }

      // Fetch stats for up to 20 members in parallel (bound the load).
      const sample = clan.members.slice(0, 20);
      const results = await Promise.allSettled(
        sample.map(async (m) => {
          const [info, tomato] = await Promise.all([
            getPlayerStats(m.account_id),
            getTomatoStats(m.account_id, m.account_name).catch(() => null),
          ]);
          return { member: m, info, tomato };
        }),
      );

      const players = results
        .filter(
          (r): r is PromiseFulfilledResult<{
            member: (typeof sample)[number];
            info: Awaited<ReturnType<typeof getPlayerStats>>;
            tomato: Awaited<ReturnType<typeof getTomatoStats>> | null;
          }> => r.status === 'fulfilled',
        )
        .map((r) => r.value)
        .filter((p) => p.info != null);

      const withStats = players.map((p) => ({
        accountId: p.member.account_id,
        nickname: p.member.account_name,
        role: p.member.role,
        wn8: p.tomato?.wn8 ?? null,
        winRate: p.info?.win_rate ?? null,
        globalRating: p.info?.global_rating ?? 0,
      }));

      const avg = (xs: Array<number | null>): number | null => {
        const valid = xs.filter((v): v is number => v != null && !Number.isNaN(v));
        if (valid.length === 0) return null;
        return valid.reduce((a, b) => a + b, 0) / valid.length;
      };

      return {
        membersCount: clan.members_count,
        avgWinRate: avg(withStats.map((p) => p.winRate)),
        avgGlobalRating: avg(withStats.map((p) => p.globalRating)),
        avgWn8: avg(withStats.map((p) => p.wn8)),
        topPlayers: withStats
          .sort((a, b) => (b.wn8 ?? 0) - (a.wn8 ?? 0))
          .slice(0, 8),
      };
    },
    staleTime: 10 * 60_000,
  });
}

export function usePlayerLookup(nickname: string, enabled: boolean) {
  return useQuery({
    queryKey: ['stats', 'lookup', nickname],
    enabled: enabled && nickname.length >= 3,
    queryFn: async () => {
      const player = await searchPlayer(nickname);
      if (!player) return null;
      const [info, tomato] = await Promise.all([
        getPlayerStats(player.account_id),
        getTomatoStats(player.account_id, player.nickname),
      ]);
      return { player, info, tomato };
    },
    staleTime: 60_000,
  });
}
