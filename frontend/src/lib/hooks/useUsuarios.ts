import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  changePassword,
  resetPassword,
} from '@/lib/api/usuarios';


// Query key factory
export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filters?: Record<string, string>) => [...usuariosKeys.lists(), { filters }] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: string) => [...usuariosKeys.details(), id] as const,
};

export function useUsuarios() {
  return useQuery({
    queryKey: usuariosKeys.lists(),
    queryFn: getUsuarios,
  });
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: usuariosKeys.detail(id),
    queryFn: () => getUsuario(id),
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateUsuario>[1] }) =>
      updateUsuario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      id,
      passwordActual,
      passwordNueva,
    }: {
      id: string;
      passwordActual: string;
      passwordNueva: string;
    }) => changePassword(id, passwordActual, passwordNueva),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetPassword(id, password),
  });
}
