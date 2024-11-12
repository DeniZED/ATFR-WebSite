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

export function validateApiResponse<T>(response: unknown): T {
  if (!response || typeof response !== 'object' || !('status' in response)) {
    throw new Error('Invalid API response format');
  }

  const typedResponse = response as { status: string; error?: { message: string }; data?: T };

  if (typedResponse.status !== 'ok') {
    throw new Error(typedResponse.error?.message || 'API response status not OK');
  }

  if (!typedResponse.data) {
    throw new Error('No data in API response');
  }

  return typedResponse.data;
}

export function buildApiUrl(endpoint: string, params: Record<string, string | number>): string {
  const API_KEY = import.meta.env.VITE_WOT_APPLICATION_ID || '';
  const WOT_API = 'https://api.worldoftanks.eu/wot/';
  
  const searchParams = new URLSearchParams({
    application_id: API_KEY,
    ...params
  });
  
  return `${WOT_API}${endpoint}?${searchParams.toString()}`;
}