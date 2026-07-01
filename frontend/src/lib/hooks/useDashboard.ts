import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';

// Query key factory
export const dashboardKeys = {
  all: ['dashboard'] as const,
  estadisticas: () => [...dashboardKeys.all, 'estadisticas'] as const,
  asistenciasRecientes: (limit: number) =>
    [...dashboardKeys.all, 'asistenciasRecientes', limit] as const,
  clasesHoy: () => [...dashboardKeys.all, 'clasesHoy'] as const,
};

export function useDashboardEstadisticas() {
  return useQuery({
    queryKey: dashboardKeys.estadisticas(),
    queryFn: () => dashboardApi.getEstadisticas(),
  });
}

export function useAsistenciasRecientes(limit: number = 10) {
  return useQuery({
    queryKey: dashboardKeys.asistenciasRecientes(limit),
    queryFn: () => dashboardApi.getAsistenciasRecientes(limit),
  });
}

export function useClasesHoy() {
  return useQuery({
    queryKey: dashboardKeys.clasesHoy(),
    queryFn: () => dashboardApi.getClasesHoy(),
  });
}
