import apiClient from './client';

export enum TipoDocumentoUsuario {
  FIRMA = 'firma',
  ANTECEDENTES_PENALES = 'antecedentes_penales',
  EXAMEN_PROTECCION = 'examen_proteccion',
  VACACIONES = 'vacaciones',
  LICENCIAS = 'licencias',
  SUSPENSION = 'suspension',
  AMONESTACION = 'amonestacion',
  OTRO = 'otro',
}

export interface DocumentoUsuario {
  id: string;
  usuario: { id: string; nombre: string; correo: string };
  tipo_documento: TipoDocumentoUsuario;
  anio: number;
  archivo_url: string;
  nombre_original: string;
  notas: string | null;
  subido_por: { id: string; nombre: string } | null;
  creado_en: string;
  actualizado_en: string;
}

export interface DocumentoTipoOption {
  value: TipoDocumentoUsuario;
  label: string;
}

export const getDocumentosUsuario = async (
  usuarioId: string,
  filters?: { tipo_documento?: string; anio?: number }
): Promise<DocumentoUsuario[]> => {
  const params: Record<string, string | number> = {};
  if (filters?.tipo_documento) params.tipo_documento = filters.tipo_documento;
  if (filters?.anio) params.anio = filters.anio;
  const response = await apiClient.get(`/usuarios/${usuarioId}/documentos`, { params });
  return response.data;
};

export const subirDocumento = async (
  usuarioId: string,
  formData: FormData
): Promise<DocumentoUsuario> => {
  const response = await apiClient.post(`/usuarios/${usuarioId}/documentos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const eliminarDocumento = async (usuarioId: string, docId: string): Promise<void> => {
  await apiClient.delete(`/usuarios/documentos/${docId}`);
};

export const getTiposDocumento = async (): Promise<DocumentoTipoOption[]> => {
  const response = await apiClient.get('/usuarios/documentos/tipos');
  return response.data;
};
