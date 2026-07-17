import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDocumentosUsuario,
  subirDocumento,
  eliminarDocumento,
  getTiposDocumento,
} from '@/lib/api/documentos-usuario';

export const documentosKeys = {
  all: ['documentos-usuario'] as const,
  lists: () => [...documentosKeys.all, 'list'] as const,
  list: (usuarioId: string) => [...documentosKeys.lists(), usuarioId] as const,
  tipos: () => [...documentosKeys.all, 'tipos'] as const,
};

export function useDocumentosUsuario(
  usuarioId: string,
  filters?: { tipo_documento?: string; anio?: number }
) {
  return useQuery({
    queryKey: [...documentosKeys.list(usuarioId), { filters }],
    queryFn: () => getDocumentosUsuario(usuarioId, filters),
    enabled: !!usuarioId,
  });
}

export function useSubirDocumento(usuarioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => subirDocumento(usuarioId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentosKeys.list(usuarioId) });
    },
  });
}

export function useEliminarDocumento(usuarioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId: string) => eliminarDocumento(usuarioId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentosKeys.list(usuarioId) });
    },
  });
}

export function useTiposDocumento() {
  return useQuery({
    queryKey: documentosKeys.tipos(),
    queryFn: getTiposDocumento,
  });
}
