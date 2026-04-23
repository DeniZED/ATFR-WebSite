import { useQuery } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { searchPlayer } from '@/lib/wot-api';
import { getPlayerExtendedStats, type PlayerExtendedStats } from '@/lib/tomato-api';

export interface ClanStats {
  clanId: number | null;
  name: string | null;
  tag: string | null;
  membersCount: number;
  sampledMembers: number;
  active24h: number;
  active7d: number;
  avgWinRate: number | null;
  avgWn8: number | null;
  avgGlobalRating: number | null;
  avgDamagePerBattle: number | null;
  totalBattles: number;
  topPlayers: Array<{
    accountId: number;
    nickname: string;
    role: string;
    wn8: number | null;
    winRate: number | null;
    battles: number;
    globalRating: number;
    lastBattleTime: number;
  }>;
  computedAt: string;
}

export function useClanStats(clanId: string = env.clanId) {
  return useQuery({
    queryKey: ['stats', 'clan', clanId],
    queryFn: async (): Promise<ClanStats> => {
      const res = await fetch(`/.netlify/functions/clan-stats?clan_id=${clanId}`);
      if (!res.ok) throw new Error(`Clan stats error: ${res.status}`);
      return (await res.json()) as ClanStats;
    },
    staleTime: 10 * 60_000,
  });
}

export function usePlayerLookup(nickname: string, enabled: boolean) {
  return useQuery({
    queryKey: ['stats', 'lookup', nickname],
    enabled: enabled && nickname.length >= 3,
    queryFn: async (): Promise<{
      player: { account_id: number; nickname: string };
      stats: PlayerExtendedStats | null;
    } | null> => {
      const player = await searchPlayer(nickname);
      if (!player) return null;
      const stats = await getPlayerExtendedStats(player.account_id, player.nickname);
      return { player, stats };
    },
    staleTime: 60_000,
  });
}
