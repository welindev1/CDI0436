import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { horariosApi } from '@/lib/api/horarios';
import type { Horario } from '@/lib/types';

// Query key factory
export const horariosKeys = {
  all: ['horarios'] as const,
  lists: () => [...horariosKeys.all, 'list'] as const,
  list: (filters?: Record<string, string>) => [...horariosKeys.lists(), { filters }] as const,
  details: () => [...horariosKeys.all, 'detail'] as const,
  detail: (id: string) => [...horariosKeys.details(), id] as const,
  disponibles: () => [...horariosKeys.all, 'disponibles'] as const,
};

export function useHorarios(filters?: Record<string, string>) {
  return useQuery({
    queryKey: horariosKeys.list(filters),
    queryFn: () => horariosApi.getAll(filters),
  });
}

export function useHorario(id: string) {
  return useQuery({
    queryKey: horariosKeys.detail(id),
    queryFn: () => horariosApi.getById(id),
    enabled: !!id,
  });
}

export function useHorariosDisponibles() {
  return useQuery({
    queryKey: horariosKeys.disponibles(),
    queryFn: () => horariosApi.getDisponibles(),
  });
}

export function useCreateHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Horario>) => horariosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: horariosKeys.lists() });
    },
  });
}

export function useUpdateHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Horario> }) =>
      horariosApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: horariosKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: horariosKeys.lists() });
    },
  });
}

export function useDeleteHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => horariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: horariosKeys.lists() });
    },
  });
}

export function useDesactivarHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => horariosApi.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: horariosKeys.lists() });
    },
  });
}
