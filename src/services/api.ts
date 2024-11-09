const BASE_URL = 'https://votre-serveur.com/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(endpoint);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    };
  }
}

export async function post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    };
  }
}

export async function put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    };
  }
}

export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(endpoint, {
      method: 'DELETE',
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    };
  }
}