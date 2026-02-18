import apiClient from './client';

export interface Ayuda {
  id: string;
  nombre_beneficiario: string;
  codigo_beneficiario: string;
  nombre_madre: string;
  nombre_tutor: string;
  tipo: 'medica' | 'alimentos' | 'otros';
  tipo_especificacion?: string;
  detalle: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  creado_en: string;
}

export const ayudasApi = {
  create: async (data: Omit<Ayuda, 'id' | 'estado' | 'creado_en'>) => {
    const response = await apiClient.post('/ayudas', data);
    return response.data;
  },

  findAll: async () => {
    const response = await apiClient.get<Ayuda[]>('/ayudas');
    return response.data;
  },

  updateEstado: async (id: string, estado: string) => {
    const response = await apiClient.patch(`/ayudas/${id}/estado`, { estado });
    return response.data;
  },

  remove: async (id: string) => {
    await apiClient.delete(`/ayudas/${id}`);
  },

  exportar: async () => {
    const response = await apiClient.get('/ayudas/exportar', { responseType: 'blob' });
    return response.data;
  },
};
