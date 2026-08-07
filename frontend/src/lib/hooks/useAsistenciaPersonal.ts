import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTrabajadores,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador,
  getAsistenciasByFecha,
  marcarEntrada,
  marcarSalida,
  eliminarAsistencia,
  actualizarNotas,
} from '@/lib/api/asistencia-personal';

export const asistenciaPersonalKeys = {
  all: ['asistencia-personal'] as const,
  trabajadores: () => [...asistenciaPersonalKeys.all, 'trabajadores'] as const,
  asistencias: () => [...asistenciaPersonalKeys.all, 'asistencias'] as const,
  porFecha: (fecha: string, turno?: string) => [...asistenciaPersonalKeys.asistencias(), fecha, turno] as const,
};

export function useTrabajadores() {
  return useQuery({
    queryKey: asistenciaPersonalKeys.trabajadores(),
    queryFn: getTrabajadores,
  });
}

export function useCreateTrabajador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrabajador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaPersonalKeys.trabajadores() });
    },
  });
}

export function useUpdateTrabajador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTrabajador>[1] }) =>
      updateTrabajador(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaPersonalKeys.trabajadores() });
    },
  });
}

export function useDeleteTrabajador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrabajador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaPersonalKeys.trabajadores() });
    },
  });
}

export function useAsistenciaPersonal(fecha: string, turno?: string) {
  return useQuery({
    queryKey: asistenciaPersonalKeys.porFecha(fecha, turno),
    queryFn: () => getAsistenciasByFecha(fecha, turno),
    enabled: !!fecha,
  });
}

export function useMarcarEntrada(trabajadorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof marcarEntrada>[1]) =>
      marcarEntrada(trabajadorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaPersonalKeys.asistencias() });
    },
  });
}

export function useMarcarSalida(trabajadorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof marcarSalida>[1]) =>
      marcarSalida(trabajadorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaPersonalKeys.asistencias() });
    },
  });
}

export function useEliminarAsistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eliminarAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaPersonalKeys.asistencias() });
    },
  });
}

export function useActualizarNotas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fecha, turno, notas }: { fecha: string; turno?: string; notas: string }) =>
      actualizarNotas(fecha, turno, notas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaPersonalKeys.asistencias() });
    },
  });
}
