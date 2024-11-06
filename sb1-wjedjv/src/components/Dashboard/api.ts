const API_KEY = '6de9de98abd254ebc17dfa65ed9b17b6';
const CLAN_ID = '500191501';
const WOT_API = 'https://api.worldoftanks.eu/wot';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchClanMembers(): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(
      `${WOT_API}/clans/info/?application_id=${API_KEY}&clan_id=${CLAN_ID}&fields=members`
    );
    const data = await response.json();
    
    if (data.status === 'ok' && data.data[CLAN_ID]) {
      return { 
        success: true, 
        data: data.data[CLAN_ID].members 
      };
    }
    
    return { 
      success: false, 
      error: 'Erreur lors de la récupération des membres' 
    };
  } catch (err) {
    return { 
      success: false, 
      error: 'Erreur de connexion à l\'API WoT' 
    };
  }
}

export async function fetchPlayerStats(accountIds: number[]): Promise<ApiResponse<Record<number, any>>> {
  try {
    if (!accountIds.length) return { success: true, data: {} };

    const response = await fetch(
      `${WOT_API}/account/info/?application_id=${API_KEY}&account_id=${accountIds.join(',')}&fields=last_battle_time`
    );
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error('WoT API Error');
    }

    const stats = {};
    for (const [accountId, playerData] of Object.entries(data.data)) {
      if (playerData) {
        stats[Number(accountId)] = {
          lastBattleTime: playerData.last_battle_time
        };
      }
    }

    return { success: true, data: stats };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques' 
    };
  }
}