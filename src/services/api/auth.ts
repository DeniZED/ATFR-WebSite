import { apiClient } from './client';
import type { ApiResponse } from '../../types';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export const authService = {
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      username,
      password
    });

    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
    }

    return response;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {});
    apiClient.clearToken();
  },

  async checkAuth(): Promise<ApiResponse<LoginResponse>> {
    return apiClient.get<LoginResponse>('/auth/check');
  }
};