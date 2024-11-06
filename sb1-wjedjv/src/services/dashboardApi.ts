import { format, subDays } from 'date-fns';

const API_KEY = '79b89bc4bce96e101f13a0b1e691491c';
const CLAN_ID = '500191501';
const WOT_API = 'https://api.worldoftanks.eu/wot';

export interface DashboardStats {
  members_count: number;
  battles_avg: number;
  efficiency: number;
  global_rating: number;
  daily_battles: { date: string; count: number }[];
}

const fetchWithTimeout = async (url: string, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch basic clan info
    const clanResponse = await fetchWithTimeout(
      `${WOT_API}/clans/info/?application_id=${API_KEY}&clan_id=${CLAN_ID}&fields=members_count,efficiency,global_rating_weighted`
    );

    if (clanResponse.status !== 'ok' || !clanResponse.data?.[CLAN_ID]) {
      throw new Error('Failed to fetch clan info');
    }

    const clanData = clanResponse.data[CLAN_ID];

    // Fetch battle statistics for the last 30 days
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      return Math.floor(date.getTime() / 1000);
    });

    const battlesPromises = dates.map(timestamp =>
      fetchWithTimeout(
        `${WOT_API}/clanratings/clans/?application_id=${API_KEY}&clan_id=${CLAN_ID}&date=${timestamp}&fields=battles_count_avg`
      )
    );

    const battlesResponses = await Promise.allSettled(battlesPromises);
    const dailyBattles = battlesResponses
      .map((response, index) => {
        if (response.status === 'fulfilled' && response.value.status === 'ok') {
          return {
            date: format(dates[index] * 1000, 'dd/MM'),
            count: response.value.data?.[CLAN_ID]?.battles_count_avg || 0
          };
        }
        return null;
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    return {
      members_count: clanData.members_count || 0,
      battles_avg: dailyBattles.reduce((acc, curr) => acc + curr.count, 0) / dailyBattles.length,
      efficiency: clanData.efficiency || 0,
      global_rating: clanData.global_rating_weighted || 0,
      daily_battles: dailyBattles
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
};