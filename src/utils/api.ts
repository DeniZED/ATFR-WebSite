import { API_KEY, WOT_API } from '../constants';
import type { ApiResponse } from '../types';

export async function fetchWithTimeout<T>(
  url: string, 
  options: RequestInit = {}, 
  timeout = 5000
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    clearTimeout(id);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    };
  }
}

export function validateApiResponse<T>(response: any): T {
  if (response.status !== 'ok') {
    throw new Error(response.error?.message || 'API response status not OK');
  }

  if (!response.data) {
    throw new Error('No data in API response');
  }

  return response.data;
}

export function buildApiUrl(endpoint: string, params: Record<string, string | number>): string {
  const searchParams = new URLSearchParams({
    application_id: API_KEY,
    ...params
  });
  
  return `${WOT_API}${endpoint}?${searchParams.toString()}`;
}