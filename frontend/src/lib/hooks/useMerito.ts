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
      minPrimaria,
      maxPrimaria,
      minSecundaria,
      maxSecundaria,
    }: {
      periodoId: string;
      cantPrimaria: number;
      cantSecundaria: number;
      minPrimaria?: number;
      maxPrimaria?: number;
      minSecundaria?: number;
      maxSecundaria?: number;
    }) => meritoApi.getGanadores(periodoId, cantPrimaria, cantSecundaria, minPrimaria, maxPrimaria, minSecundaria, maxSecundaria),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...meritoKeys.ganadores(variables.periodoId)],
      });
    },
  });
}

export function useGanadoresMerito(
  periodoId: string,
  cantPrimaria = 3,
  cantSecundaria = 3,
  minPrimaria?: number,
  maxPrimaria?: number,
  minSecundaria?: number,
  maxSecundaria?: number,
) {
  return useQuery({
    queryKey: [...meritoKeys.ganadores(periodoId), cantPrimaria, cantSecundaria, minPrimaria, maxPrimaria, minSecundaria, maxSecundaria],
    queryFn: () => meritoApi.getGanadores(periodoId, cantPrimaria, cantSecundaria, minPrimaria, maxPrimaria, minSecundaria, maxSecundaria),
    enabled: !!periodoId,
  });
}
