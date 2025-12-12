import apiClient from './client';
import { LoginCredentials, RegisterData, AuthResponse, Usuario } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<Usuario> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  validateToken: async (): Promise<{ valid: boolean; usuario: Usuario }> => {
    const response = await apiClient.get('/auth/validate');
    return response.data;
  },
};