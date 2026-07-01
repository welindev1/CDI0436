import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clasesApi } from '@/lib/api/clases';
import { asistenciasApi } from '@/lib/api/asistencias';
import type { Clase, FotoAsistencia } from '@/lib/types';

// Query key factory
export const clasesKeys = {
  all: ['clases'] as const,
  lists: () => [...clasesKeys.all, 'list'] as const,
  list: (filters?: Record<string, string>) => [...clasesKeys.lists(), { filters }] as const,
  details: () => [...clasesKeys.all, 'detail'] as const,
  detail: (id: string) => [...clasesKeys.details(), id] as const,
  estadisticas: (id: string) => [...clasesKeys.all, 'estadisticas', id] as const,
  porTutor: (tutorId: string) => [...clasesKeys.all, 'porTutor', tutorId] as const,
  beneficiarios: () => [...clasesKeys.all, 'beneficiarios'] as const,
};

export function useClases(filters?: Record<string, string>) {
  return useQuery({
    queryKey: clasesKeys.list(filters),
    queryFn: () => clasesApi.getAll(filters),
  });
}

export function useClase(id: string) {
  return useQuery({
    queryKey: clasesKeys.detail(id),
    queryFn: () => clasesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateClase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Clase>) => clasesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clasesKeys.lists() });
    },
  });
}

export function useUpdateClase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Clase> }) =>
      clasesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clasesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: clasesKeys.lists() });
    },
  });
}

export function useDeleteClase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clasesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clasesKeys.lists() });
    },
  });
}

export function useClasesEstadisticas(id: string) {
  return useQuery({
    queryKey: clasesKeys.estadisticas(id),
    queryFn: () => clasesApi.getEstadisticas(id),
    enabled: !!id,
  });
}

export function useClasesPorTutor(tutorId: string) {
  return useQuery({
    queryKey: clasesKeys.porTutor(tutorId),
    queryFn: () => clasesApi.getByTutor(tutorId),
    enabled: !!tutorId,
  });
}

// ─── Beneficiarios de una clase ────────────────────────────────────────────────

export function useAgregarBeneficiarios() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claseId, beneficiarioIds }: { claseId: string; beneficiarioIds: string[] }) =>
      clasesApi.agregarBeneficiarios(claseId, beneficiarioIds),
    onSuccess: (_, { claseId }) => {
      queryClient.invalidateQueries({ queryKey: clasesKeys.detail(claseId) });
      queryClient.invalidateQueries({ queryKey: clasesKeys.lists() });
    },
  });
}

export function useRemoverBeneficiario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claseId, beneficiarioId }: { claseId: string; beneficiarioId: string }) =>
      clasesApi.removerBeneficiario(claseId, beneficiarioId),
    onSuccess: (_, { claseId }) => {
      queryClient.invalidateQueries({ queryKey: clasesKeys.detail(claseId) });
      queryClient.invalidateQueries({ queryKey: clasesKeys.lists() });
    },
  });
}

// ─── Fotos de asistencia ──────────────────────────────────────────────────────

export const fotosKeys = {
  all: ['fotos-asistencia'] as const,
  porClaseYFecha: (claseId: string, fecha: string) =>
    [...fotosKeys.all, claseId, fecha] as const,
};

export function useFotosAsistencia(claseId: string, fecha: string) {
  return useQuery({
    queryKey: fotosKeys.porClaseYFecha(claseId, fecha),
    queryFn: () => asistenciasApi.getFoto(claseId, fecha),
    enabled: !!claseId && !!fecha,
    select: (data: FotoAsistencia) => [data],
  });
}

export function useSubirFotoAsistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      claseId,
      fecha,
      imagenBase64,
    }: {
      claseId: string;
      fecha: string;
      imagenBase64: string;
    }) => asistenciasApi.subirFoto(claseId, fecha, imagenBase64),
    onSuccess: (_, { claseId, fecha }) => {
      queryClient.invalidateQueries({
        queryKey: fotosKeys.porClaseYFecha(claseId, fecha),
      });
    },
  });
}

export function useEliminarFotoAsistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fotoId: string) => asistenciasApi.eliminarFoto(fotoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fotosKeys.all });
    },
  });
}
