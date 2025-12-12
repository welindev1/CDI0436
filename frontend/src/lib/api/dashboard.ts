import apiClient from './client';

export const dashboardApi = {
  getEstadisticas: async () => {
    const response = await apiClient.get('/dashboard/estadisticas');
    return response.data;
  },

  getAsistenciasRecientes: async (limit: number = 10) => {
    const response = await apiClient.get(`/asistencias?limit=${limit}`);
    return response.data;
  },

  getClasesHoy: async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get(`/clases?fecha=${today}`);
    return response.data;
  },
};