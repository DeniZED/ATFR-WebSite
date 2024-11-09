import { CLAN_ID } from '../../constants';
import { buildApiUrl, fetchWithTimeout, validateApiResponse } from '../../utils/api';
import type { ClanStats, ClanActivity, PlayerStats } from '../../types';

export async function fetchClanStats(): Promise<ClanStats> {
  const response = await fetchWithTimeout(buildApiUrl('/clans/info/', {
    clan_id: CLAN_ID,
    fields: 'members_count,battles_count_avg_daily,wins_ratio_avg,global_rating_avg'
  }));

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch clan stats');
  }

  const data = validateApiResponse<Record<string, ClanStats>>(response.data);
  return data[CLAN_ID];
}

export async function fetchClanActivity(days: number = 30): Promise<ClanActivity[]> {
  const response = await fetchWithTimeout(buildApiUrl('/clans/battles/', {
    clan_id: CLAN_ID
  }));

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch clan activity');
  }

  const data = validateApiResponse<Record<string, ClanActivity>>(response.data);
  return Object.entries(data).map(([date, activity]) => ({
    date,
    ...activity
  }));
}

export async function fetchTopPlayers(): Promise<PlayerStats[]> {
  const response = await fetchWithTimeout(buildApiUrl('/clans/info/', {
    clan_id: CLAN_ID,
    fields: 'members'
  }));

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch top players');
  }

  const data = validateApiResponse<Record<string, { members: PlayerStats[] }>>(response.data);
  return data[CLAN_ID].members
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
}