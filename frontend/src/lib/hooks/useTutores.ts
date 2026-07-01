import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tutoresApi } from '@/lib/api/tutores';
import type { Tutor } from '@/lib/types';

// Query key factory
export const tutoresKeys = {
  all: ['tutores'] as const,
  lists: () => [...tutoresKeys.all, 'list'] as const,
  list: (filters?: Record<string, string>) => [...tutoresKeys.lists(), { filters }] as const,
  details: () => [...tutoresKeys.all, 'detail'] as const,
  detail: (id: string) => [...tutoresKeys.details(), id] as const,
};

export function useTutores(filters?: Record<string, string>) {
  return useQuery({
    queryKey: tutoresKeys.list(filters),
    queryFn: () => tutoresApi.getAll(filters),
  });
}

export function useTutor(id: string) {
  return useQuery({
    queryKey: tutoresKeys.detail(id),
    queryFn: () => tutoresApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Tutor>) => tutoresApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutoresKeys.lists() });
    },
  });
}

export function useUpdateTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tutor> }) =>
      tutoresApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tutoresKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tutoresKeys.lists() });
    },
  });
}

export function useDeleteTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tutoresApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutoresKeys.lists() });
    },
  });
}

export function useDesactivarTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tutoresApi.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutoresKeys.lists() });
    },
  });
}
