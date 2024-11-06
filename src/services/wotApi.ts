const API_KEY = '6de9de98abd254ebc17dfa65ed9b17b6';

interface WotApiResponse<T> {
  status: string;
  error?: {
    code: number;
    message: string;
    field: string | null;
  };
  data: T;
}

interface PlayerSearchResult {
  account_id: number;
  nickname: string;
}

export async function searchPlayer(nickname: string): Promise<PlayerSearchResult> {
  const response = await fetch(
    `https://api.worldoftanks.eu/wot/account/list/?application_id=${API_KEY}&search=${encodeURIComponent(nickname)}`
  );

  if (!response.ok) {
    throw new Error('Erreur de connexion à l\'API WoT');
  }

  const data: WotApiResponse<PlayerSearchResult[]> = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.data?.length) {
    throw new Error('Joueur non trouvé');
  }

  return {
    account_id: data.data[0].account_id,
    nickname: data.data[0].nickname
  };
}