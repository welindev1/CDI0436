import apiClient from './client';
import { Supervivencia, AsistenciaSupervivenciaResponse } from '../types';

interface AsistenciaBeneficiario {
  beneficiario_id: string;
  presente: boolean;
  observaciones?: string;
}

interface RegistrarAsistenciaData {
  fecha: string;
  asistencias: AsistenciaBeneficiario[];
}

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

  create: async (data: Partial<Supervivencia> & { tutor_id?: string }): Promise<Supervivencia> => {
    const response = await apiClient.post('/supervivencias', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Supervivencia> & { tutor_id?: string }): Promise<Supervivencia> => {
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

  // Métodos de asistencia
  registrarAsistencia: async (id: string, data: RegistrarAsistenciaData): Promise<any> => {
    const response = await apiClient.post(`/supervivencias/${id}/asistencias`, data);
    return response.data;
  },

  getAsistenciasPorFecha: async (id: string, fecha: string): Promise<AsistenciaSupervivenciaResponse> => {
    const response = await apiClient.get(`/supervivencias/${id}/asistencias?fecha=${fecha}`);
    return response.data;
  },

  getHistorialAsistencias: async (id: string, fechaInicio?: string, fechaFin?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    const response = await apiClient.get(`/supervivencias/${id}/asistencias/historial?${params}`);
    return response.data;
  },

  getFechasConAsistencia: async (id: string): Promise<string[]> => {
    const response = await apiClient.get(`/supervivencias/${id}/asistencias/fechas`);
    return response.data;
  },
};
