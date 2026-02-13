import apiClient from './client';
import { Rol } from './roles';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol | null;
  rol_id: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface CreateUsuarioDto {
  nombre: string;
  correo: string;
  password: string;
  rol_id: string;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  correo?: string;
  rol_id?: string;
  activo?: boolean;
}

export const getUsuarios = async (): Promise<Usuario[]> => {
  const response = await apiClient.get('/usuarios');
  return response.data;
};

export const getUsuario = async (id: string): Promise<Usuario> => {
  const response = await apiClient.get(`/usuarios/${id}`);
  return response.data;
};

export const createUsuario = async (data: CreateUsuarioDto): Promise<Usuario> => {
  const response = await apiClient.post('/usuarios', data);
  return response.data;
};

export const updateUsuario = async (id: string, data: UpdateUsuarioDto): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUsuario = async (id: string): Promise<void> => {
  await apiClient.delete(`/usuarios/${id}`);
};

export const desactivarUsuario = async (id: string): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}/desactivar`);
  return response.data;
};

export const resetPassword = async (id: string, password: string): Promise<void> => {
  await apiClient.patch(`/usuarios/${id}/reset-password`, { password });
};

export const changePassword = async (
  id: string,
  passwordActual: string,
  passwordNueva: string
): Promise<void> => {
  await apiClient.patch(`/usuarios/${id}/cambiar-password`, {
    passwordActual,
    passwordNueva,
  });
};
