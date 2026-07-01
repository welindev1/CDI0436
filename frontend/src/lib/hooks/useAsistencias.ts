import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenciasApi } from '@/lib/api/asistencias';
import type { EstadoAsistencia } from '@/lib/types';

// Query key factory
export const asistenciasKeys = {
  all: ['asistencias'] as const,
  lists: () => [...asistenciasKeys.all, 'list'] as const,
  list: (filters?: Record<string, string>) => [...asistenciasKeys.lists(), { filters }] as const,
  details: () => [...asistenciasKeys.all, 'detail'] as const,
  detail: (id: string) => [...asistenciasKeys.details(), id] as const,
  porClaseYFecha: (claseId: string, fecha: string) =>
    [...asistenciasKeys.all, 'porClaseYFecha', claseId, fecha] as const,
  reporteClase: (claseId: string, fechaInicio?: string, fechaFin?: string) =>
    [...asistenciasKeys.all, 'reporteClase', claseId, { fechaInicio, fechaFin }] as const,
  reporteBeneficiario: (beneficiarioId: string, fechaInicio?: string, fechaFin?: string) =>
    [...asistenciasKeys.all, 'reporteBeneficiario', beneficiarioId, { fechaInicio, fechaFin }] as const,
  estadisticasMensuales: (mes: number, anio: number) =>
    [...asistenciasKeys.all, 'estadisticasMensuales', mes, anio] as const,
  resumenPorFecha: (fecha: string) =>
    [...asistenciasKeys.all, 'resumenPorFecha', fecha] as const,
  reporteGlobal: (fechaInicio?: string, fechaFin?: string) =>
    [...asistenciasKeys.all, 'reporteGlobal', { fechaInicio, fechaFin }] as const,
};

export function useAsistencias(filters?: Record<string, string>) {
  return useQuery({
    queryKey: asistenciasKeys.list(filters),
    queryFn: () => asistenciasApi.getAll(filters),
  });
}

export function useAsistencia(id: string) {
  return useQuery({
    queryKey: asistenciasKeys.detail(id),
    queryFn: () => asistenciasApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAsistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof asistenciasApi.create>[0]) => asistenciasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciasKeys.all });
    },
  });
}

export function useRegistrarAsistenciaMasiva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      claseId: string;
      fecha: string;
      asistencias: Array<{
        beneficiarioId: string;
        estado: EstadoAsistencia;
        observaciones?: string;
      }>;
    }) => asistenciasApi.registrarAsistenciaMasiva(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciasKeys.all });
    },
  });
}

export function useAsistenciasPorClaseYFecha(claseId: string, fecha: string) {
  return useQuery({
    queryKey: asistenciasKeys.porClaseYFecha(claseId, fecha),
    queryFn: () => asistenciasApi.getByClaseYFecha(claseId, fecha),
    enabled: !!claseId && !!fecha,
  });
}

export function useReporteAsistenciaClase(claseId: string, fechaInicio?: string, fechaFin?: string) {
  return useQuery({
    queryKey: asistenciasKeys.reporteClase(claseId, fechaInicio, fechaFin),
    queryFn: () => asistenciasApi.getReportePorClase(claseId, fechaInicio, fechaFin),
    enabled: !!claseId,
  });
}

export function useReporteAsistenciaBeneficiario(
  beneficiarioId: string,
  fechaInicio?: string,
  fechaFin?: string
) {
  return useQuery({
    queryKey: asistenciasKeys.reporteBeneficiario(beneficiarioId, fechaInicio, fechaFin),
    queryFn: () => asistenciasApi.getReportePorBeneficiario(beneficiarioId, fechaInicio, fechaFin),
    enabled: !!beneficiarioId,
  });
}

export function useEstadisticasAsistenciaMensual(mes: number, anio: number) {
  return useQuery({
    queryKey: asistenciasKeys.estadisticasMensuales(mes, anio),
    queryFn: () => asistenciasApi.getEstadisticasMensuales(mes, anio),
    enabled: mes >= 1 && mes <= 12 && anio > 2000,
  });
}

export function useResumenAsistenciaPorFecha(fecha: string) {
  return useQuery({
    queryKey: asistenciasKeys.resumenPorFecha(fecha),
    queryFn: () => asistenciasApi.getResumenPorFecha(fecha),
    enabled: !!fecha,
  });
}

// Photo hooks
export function useFotosAsistencia(claseId: string, fecha: string) {
  return useQuery({
    queryKey: [...asistenciasKeys.all, 'fotos', claseId, fecha] as const,
    queryFn: () => asistenciasApi.getFoto(claseId, fecha),
    enabled: !!claseId && !!fecha,
  });
}

export function useSubirFotoAsistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claseId, fecha, imagenBase64 }: { claseId: string; fecha: string; imagenBase64: string }) =>
      asistenciasApi.subirFoto(claseId, fecha, imagenBase64),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...asistenciasKeys.all, 'fotos', variables.claseId, variables.fecha] });
    },
  });
}

export function useEliminarFotoAsistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fotoId: string) => asistenciasApi.eliminarFoto(fotoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...asistenciasKeys.all, 'fotos'] });
    },
  });
}
