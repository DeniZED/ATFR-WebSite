import { buildApiUrl, fetchWithTimeout, validateApiResponse } from '../../utils/api';
import type { PlayerStats } from '../../types';

export async function searchPlayer(nickname: string): Promise<{ account_id: number; nickname: string }> {
  const response = await fetchWithTimeout(buildApiUrl('/account/list/', {
    search: nickname
  }));

  if (!response.success) {
    throw new Error(response.error || 'Failed to search player');
  }

  const data = validateApiResponse<Array<{ account_id: number; nickname: string }>>(response.data);
  
  if (!data.length) {
    throw new Error('Player not found');
  }

  return {
    account_id: data[0].account_id,
    nickname: data[0].nickname
  };
}

export async function fetchPlayerStats(accountId: number): Promise<PlayerStats> {
  const response = await fetchWithTimeout(buildApiUrl('/account/info/', {
    account_id: accountId,
    fields: 'global_rating,statistics.all'
  }));

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch player stats');
  }

  const data = validateApiResponse<Record<string, PlayerStats>>(response.data);
  return data[accountId];
}