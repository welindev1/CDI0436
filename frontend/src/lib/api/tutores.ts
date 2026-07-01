import apiClient from './client';
import { Tutor } from '../types';

export const tutoresApi = {
  getAll: async (filters?: Record<string, string>): Promise<Tutor[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString());
        }
      });
    }
    const response = await apiClient.get(`/tutores?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Tutor> => {
    const response = await apiClient.get(`/tutores/${id}`);
    return response.data;
  },

  create: async (data: Partial<Tutor>): Promise<Tutor> => {
    const response = await apiClient.post('/tutores', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Tutor>): Promise<Tutor> => {
    const response = await apiClient.patch(`/tutores/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tutores/${id}`);
  },

  desactivar: async (id: string): Promise<Tutor> => {
    const response = await apiClient.patch(`/tutores/${id}/desactivar`);
    return response.data;
  },
};