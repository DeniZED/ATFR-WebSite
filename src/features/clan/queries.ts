import { useQuery } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { getClanInfo } from '@/lib/wot-api';

export function useClanInfo(clanId: string = env.clanId) {
  return useQuery({
    queryKey: ['clan', 'info', clanId],
    queryFn: () => getClanInfo(clanId),
    staleTime: 5 * 60_000,
  });
}
