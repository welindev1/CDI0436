import apiClient from './client';
import type { MenuNutricion, TandaNutricion } from '@/lib/types';

export type { MenuNutricion, TandaNutricion };

export const nutricionApi = {
  // Obtener todos los menús de un mes
  getByMes: async (anio: number, mes: number): Promise<MenuNutricion[]> => {
    const response = await apiClient.get(`/nutricion/menus?anio=${anio}&mes=${mes}`);
    return response.data;
  },

  // Obtener menú por fecha y tanda
  getByFechaYTanda: async (fecha: string, tanda: TandaNutricion): Promise<MenuNutricion | null> => {
    try {
      const response = await apiClient.get(`/nutricion/menus/fecha/${fecha}/${tanda}`);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 404) return null;
      throw err;
    }
  },

  // Crear menú
  create: async (data: {
    fecha: string;
    tanda: TandaNutricion;
    titulo_menu: string;
    meriendas_servidas?: number;
    observaciones?: string;
  }): Promise<MenuNutricion> => {
    const response = await apiClient.post('/nutricion/menus', data);
    return response.data;
  },

  // Actualizar menú (meriendas, observaciones, título)
  update: async (
    id: string,
    data: { titulo_menu?: string; meriendas_servidas?: number; observaciones?: string },
  ): Promise<MenuNutricion> => {
    const response = await apiClient.patch(`/nutricion/menus/${id}`, data);
    return response.data;
  },

  // Eliminar menú
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/nutricion/menus/${id}`);
  },
};
