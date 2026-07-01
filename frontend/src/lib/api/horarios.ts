import apiClient from './client';
import { Horario } from '../types';

export const horariosApi = {
  getAll: async (filters?: Record<string, string>): Promise<Horario[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
    }
    const response = await apiClient.get(`/horarios?${params}`);
    return response.data;
  },

  getDisponibles: async (): Promise<Horario[]> => {
    const response = await apiClient.get('/horarios/disponibles');
    return response.data;
  },

  getById: async (id: string): Promise<Horario> => {
    const response = await apiClient.get(`/horarios/${id}`);
    return response.data;
  },

  create: async (data: Partial<Horario>): Promise<Horario> => {
    const response = await apiClient.post('/horarios', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Horario>): Promise<Horario> => {
    const response = await apiClient.patch(`/horarios/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/horarios/${id}`);
  },

  desactivar: async (id: string): Promise<Horario> => {
    const response = await apiClient.patch(`/horarios/${id}/desactivar`);
    return response.data;
  },
};