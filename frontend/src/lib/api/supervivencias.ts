import apiClient from './client';
import { Supervivencia } from '../types';

export const supervivenciasApi = {
  getAll: async (filters?: any): Promise<Supervivencia[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
    }
    const response = await apiClient.get(`/supervivencias?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Supervivencia> => {
    const response = await apiClient.get(`/supervivencias/${id}`);
    return response.data;
  },

  getByCodigo: async (codigo: string): Promise<Supervivencia> => {
    const response = await apiClient.get(`/supervivencias/codigo/${codigo}`);
    return response.data;
  },

  create: async (data: Partial<Supervivencia>): Promise<Supervivencia> => {
    const response = await apiClient.post('/supervivencias', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Supervivencia>): Promise<Supervivencia> => {
    const response = await apiClient.patch(`/supervivencias/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/supervivencias/${id}`);
  },

  desactivar: async (id: string): Promise<Supervivencia> => {
    const response = await apiClient.patch(`/supervivencias/${id}/desactivar`);
    return response.data;
  },

  getEstadisticas: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/supervivencias/${id}/estadisticas`);
    return response.data;
  },

  agregarBeneficiarios: async (id: string, beneficiarioIds: string[]): Promise<Supervivencia> => {
    const response = await apiClient.post(`/supervivencias/${id}/beneficiarios`, { beneficiarioIds });
    return response.data;
  },

  removerBeneficiario: async (id: string, beneficiarioId: string): Promise<void> => {
    await apiClient.delete(`/supervivencias/${id}/beneficiarios/${beneficiarioId}`);
  },
};
