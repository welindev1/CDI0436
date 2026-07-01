import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutricionApi } from '@/lib/api/nutricion';
import type { TandaNutricion } from '@/lib/types';

// Query key factory
export const nutricionKeys = {
  all: ['nutricion'] as const,
  menus: () => [...nutricionKeys.all, 'menus'] as const,
  porMes: (anio: number, mes: number) => [...nutricionKeys.menus(), anio, mes] as const,
  porFechaYTanda: (fecha: string, tanda: TandaNutricion) =>
    [...nutricionKeys.menus(), fecha, tanda] as const,
};

export function useMenusNutricion(anio: number, mes: number) {
  return useQuery({
    queryKey: nutricionKeys.porMes(anio, mes),
    queryFn: () => nutricionApi.getByMes(anio, mes),
    enabled: anio > 2000 && mes >= 1 && mes <= 12,
  });
}

export function useMenuNutricionPorFecha(fecha: string, tanda: TandaNutricion) {
  return useQuery({
    queryKey: nutricionKeys.porFechaYTanda(fecha, tanda),
    queryFn: () => nutricionApi.getByFechaYTanda(fecha, tanda),
    enabled: !!fecha && !!tanda,
  });
}

export function useCreateMenuNutricion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof nutricionApi.create>[0]) =>
      nutricionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutricionKeys.menus() });
    },
  });
}

export function useUpdateMenuNutricion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof nutricionApi.update>[1];
    }) => nutricionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutricionKeys.menus() });
    },
  });
}

export function useDeleteMenuNutricion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => nutricionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutricionKeys.menus() });
    },
  });
}
