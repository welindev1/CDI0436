import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meritoApi } from '@/lib/api/merito';

// Query key factory
export const meritoKeys = {
  all: ['merito'] as const,
  periodos: () => [...meritoKeys.all, 'periodos'] as const,
  dashboardPeriodo: (id: string) => [...meritoKeys.all, 'dashboard', id] as const,
  ganadores: (periodoId: string) => [...meritoKeys.all, 'ganadores', periodoId] as const,
};

export function usePeriodosMerito() {
  return useQuery({
    queryKey: meritoKeys.periodos(),
    queryFn: () => meritoApi.getPeriodos(),
  });
}

export function useDashboardPeriodo(id: string) {
  return useQuery({
    queryKey: meritoKeys.dashboardPeriodo(id),
    queryFn: () => meritoApi.getDashboardPeriodo(id),
    enabled: !!id,
  });
}

export function useNotasMerito(periodoId: string) {
  return useQuery({
    queryKey: meritoKeys.dashboardPeriodo(periodoId),
    queryFn: () => meritoApi.getDashboardPeriodo(periodoId),
    enabled: !!periodoId,
    select: (data) => data.notas_registradas,
  });
}

export function useCreatePeriodoMerito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nombre: string; anio: number; estado?: string }) =>
      meritoApi.createPeriodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meritoKeys.periodos() });
    },
  });
}

export function useAgregarNotaMerito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      periodoId,
      data,
    }: {
      periodoId: string;
      data: Parameters<typeof meritoApi.agregarNota>[1];
    }) => meritoApi.agregarNota(periodoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meritoKeys.all });
    },
  });
}

export function useGenerarGanadoresMerito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      periodoId,
      cantPrimaria,
      cantSecundaria,
    }: {
      periodoId: string;
      cantPrimaria: number;
      cantSecundaria: number;
    }) => meritoApi.getGanadores(periodoId, cantPrimaria, cantSecundaria),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...meritoKeys.ganadores(variables.periodoId), variables.cantPrimaria, variables.cantSecundaria],
      });
    },
  });
}

export function useGanadoresMerito(
  periodoId: string,
  cantPrimaria = 3,
  cantSecundaria = 3
) {
  return useQuery({
    queryKey: [...meritoKeys.ganadores(periodoId), cantPrimaria, cantSecundaria],
    queryFn: () => meritoApi.getGanadores(periodoId, cantPrimaria, cantSecundaria),
    enabled: !!periodoId,
  });
}
