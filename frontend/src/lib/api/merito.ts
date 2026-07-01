import apiClient from './client';

export interface PeriodoMerito {
  id: string;
  nombre: string;
  anio: number;
  estado: string;
  creado_en: string;
}

export interface NotaMerito {
  id: string;
  beneficiario_id: string;
  codigo: string;
  nombre: string;
  apellido: string;
  ciclo: 'Primaria' | 'Secundaria';
  curso: number;
  matematicas: number;
  lengua_espanola: number;
  naturales: number;
  sociales: number;
  promedio: number;
}

export interface BeneficiarioPendiente {
  id: string;
  codigo: string;
  nombre: string;
  apellido: string;
}

export interface PeriodoDashboard {
  periodo: PeriodoMerito;
  faltan_por_entregar: BeneficiarioPendiente[];
  notas_registradas: NotaMerito[];
}

export interface GanadorMerito {
  id: string;
  codigo: string;
  nombre: string;
  curso: number;
  promedio: number;
}

export interface GanadoresResponse {
  primaria: GanadorMerito[];
  secundaria: GanadorMerito[];
}

export const meritoApi = {
  getPeriodos: async (): Promise<PeriodoMerito[]> => {
    const response = await apiClient.get('/merito/periodos');
    return response.data;
  },

  createPeriodo: async (data: { nombre: string; anio: number; estado?: string }): Promise<PeriodoMerito> => {
    const response = await apiClient.post('/merito/periodos', data);
    return response.data;
  },

  getDashboardPeriodo: async (id: string): Promise<PeriodoDashboard> => {
    const response = await apiClient.get(`/merito/periodos/${id}/dashboard`);
    return response.data;
  },

  agregarNota: async (periodo_id: string, data: { beneficiario_id: string; ciclo: string; curso: number; matematicas: number; lengua_espanola: number; naturales: number; sociales: number }): Promise<NotaMerito> => {
    const response = await apiClient.post(`/merito/periodos/${periodo_id}/notas`, data);
    return response.data;
  },

  getGanadores: async (periodo_id: string, cant_primaria: number = 3, cant_secundaria: number = 3): Promise<GanadoresResponse> => {
    const response = await apiClient.get(`/merito/periodos/${periodo_id}/ganadores?cant_primaria=${cant_primaria}&cant_secundaria=${cant_secundaria}`);
    return response.data;
  },

  deletePeriodo: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/merito/periodos/${id}`);
    return response.data;
  }
};
