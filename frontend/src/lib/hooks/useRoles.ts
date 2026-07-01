import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getRol,
  createRol,
  updateRol,
  deleteRol,
  getPermisosAgrupados,
} from '@/lib/api/roles';


// Query key factory
export const rolesKeys = {
  all: ['roles'] as const,
  lists: () => [...rolesKeys.all, 'list'] as const,
  list: (filters?: Record<string, string>) => [...rolesKeys.lists(), { filters }] as const,
  details: () => [...rolesKeys.all, 'detail'] as const,
  detail: (id: string) => [...rolesKeys.details(), id] as const,
  permisos: () => [...rolesKeys.all, 'permisos'] as const,
  permisosAgrupados: () => [...rolesKeys.all, 'permisosAgrupados'] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: rolesKeys.lists(),
    queryFn: getRoles,
  });
}

export function useRol(id: string) {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => getRol(id),
    enabled: !!id,
  });
}

export function useCreateRol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
}

export function useUpdateRol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateRol>[1] }) =>
      updateRol(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
}

export function useDeleteRol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
}

export function usePermisosAgrupados() {
  return useQuery({
    queryKey: rolesKeys.permisosAgrupados(),
    queryFn: getPermisosAgrupados,
  });
}
