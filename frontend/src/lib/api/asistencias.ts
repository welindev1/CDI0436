import apiClient from './client';
import { Asistencia, EstadoAsistencia } from '../types';

export const asistenciasApi = {
  getAll: async (filters?: any): Promise<Asistencia[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
    }
    const response = await apiClient.get(`/asistencias?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Asistencia> => {
    const response = await apiClient.get(`/asistencias/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<Asistencia> => {
    const response = await apiClient.post('/asistencias', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<Asistencia> => {
    const response = await apiClient.patch(`/asistencias/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/asistencias/${id}`);
  },

  // Registro masivo
  registrarAsistenciaMasiva: async (data: {
    claseId: string;
    fecha: string;
    asistencias: Array<{
      beneficiarioId: string;
      estado: EstadoAsistencia;
      observaciones?: string;
    }>;
  }): Promise<Asistencia[]> => {
    const response = await apiClient.post('/asistencias/masiva', data);
    return response.data;
  },

  // Marcar todos con el mismo estado
  marcarTodos: async (data: {
    claseId: string;
    fecha: string;
    estado: EstadoAsistencia;
    observaciones?: string;
  }): Promise<Asistencia[]> => {
    const response = await apiClient.post('/asistencias/marcar-todos', data);
    return response.data;
  },

  // Justificar ausencias
  justificarMasivo: async (data: {
    claseId: string;
    fecha: string;
    beneficiarioIds: string[];
    observaciones?: string;
  }): Promise<Asistencia[]> => {
    const response = await apiClient.post('/asistencias/justificar-masivo', data);
    return response.data;
  },

  // Obtener asistencias por clase y fecha
  getByClaseYFecha: async (claseId: string, fecha: string): Promise<Asistencia[]> => {
    const response = await apiClient.get(`/asistencias/clase/${claseId}/fecha/${fecha}`);
    return response.data;
  },

  // Reportes
  getReportePorClase: async (
    claseId: string, 
    fechaInicio?: string, 
    fechaFin?: string
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    const response = await apiClient.get(`/asistencias/reporte/clase/${claseId}?${params}`);
    return response.data;
  },

  getReportePorBeneficiario: async (
    beneficiarioId: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    const response = await apiClient.get(`/asistencias/reporte/beneficiario/${beneficiarioId}?${params}`);
    return response.data;
  },

  getEstadisticasMensuales: async (mes: number, anio: number): Promise<any> => {
    const response = await apiClient.get(`/asistencias/estadisticas/mensuales/${mes}/${anio}`);
    return response.data;
  },
  getResumenPorFecha: async (fecha: string): Promise<any[]> => {
    const response = await apiClient.get(`/asistencias/resumen/fecha/${fecha}`);
    return response.data;
  },
};