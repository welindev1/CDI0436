import apiClient from './client';
import { Clase, EstadisticasGenerales } from '../types';

export const clasesApi = {
  getAll: async (filters?: Record<string, string>): Promise<Clase[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
    }
    const response = await apiClient.get(`/clases?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Clase> => {
    const response = await apiClient.get(`/clases/${id}`);
    return response.data;
  },

  getByCodigo: async (codigo: string): Promise<Clase> => {
    const response = await apiClient.get(`/clases/codigo/${codigo}`);
    return response.data;
  },

  getByTutor: async (tutorId: string): Promise<Clase[]> => {
    const response = await apiClient.get(`/clases/tutor/${tutorId}`);
    return response.data;
  },

  create: async (data: Partial<Clase>): Promise<Clase> => {
    const response = await apiClient.post('/clases', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Clase>): Promise<Clase> => {
    const response = await apiClient.patch(`/clases/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clases/${id}`);
  },

  desactivar: async (id: string): Promise<Clase> => {
    const response = await apiClient.patch(`/clases/${id}/desactivar`);
    return response.data;
  },

  getEstadisticas: async (id: string): Promise<EstadisticasGenerales> => {
    const response = await apiClient.get(`/clases/${id}/estadisticas`);
    return response.data;
  },

  agregarBeneficiarios: async (id: string, beneficiarioIds: string[]): Promise<Clase> => {
    const response = await apiClient.post(`/clases/${id}/beneficiarios`, { beneficiarioIds });
    return response.data;
  },

  removerBeneficiario: async (id: string, beneficiarioId: string): Promise<void> => {
    await apiClient.delete(`/clases/${id}/beneficiarios/${beneficiarioId}`);
  },
};