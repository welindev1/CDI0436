import apiClient from './client';

export interface Permiso {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  accion: string;
  descripcion: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  es_super_admin: boolean;
  activo: boolean;
  permisos: Permiso[];
  creado_en: string;
  actualizado_en: string;
}

export interface CreateRolDto {
  nombre: string;
  descripcion?: string;
  es_super_admin?: boolean;
  permisos_ids?: string[];
}

export interface UpdateRolDto {
  nombre?: string;
  descripcion?: string;
  es_super_admin?: boolean;
  activo?: boolean;
  permisos_ids?: string[];
}

// Roles
export const getRoles = async (): Promise<Rol[]> => {
  const response = await apiClient.get('/roles');
  return response.data;
};

export const getRol = async (id: string): Promise<Rol> => {
  const response = await apiClient.get(`/roles/${id}`);
  return response.data;
};

export const createRol = async (data: CreateRolDto): Promise<Rol> => {
  const response = await apiClient.post('/roles', data);
  return response.data;
};

export const updateRol = async (id: string, data: UpdateRolDto): Promise<Rol> => {
  const response = await apiClient.patch(`/roles/${id}`, data);
  return response.data;
};

export const deleteRol = async (id: string): Promise<void> => {
  await apiClient.delete(`/roles/${id}`);
};

export const asignarPermisos = async (id: string, permisosIds: string[]): Promise<Rol> => {
  const response = await apiClient.patch(`/roles/${id}/permisos`, { permisos_ids: permisosIds });
  return response.data;
};

// Permisos
export const getPermisos = async (): Promise<Permiso[]> => {
  const response = await apiClient.get('/roles/permisos');
  return response.data;
};

export const getPermisosAgrupados = async (): Promise<Record<string, Permiso[]>> => {
  const response = await apiClient.get('/roles/permisos/agrupados');
  return response.data;
};
