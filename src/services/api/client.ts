import { config } from '../../config/api.config';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = config.API_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue'
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint);
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'DELETE',
    });
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

export const apiClient = new ApiClient();