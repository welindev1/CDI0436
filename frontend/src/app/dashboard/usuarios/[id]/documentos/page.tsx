'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DocumentoCarpeta from '@/components/usuarios/DocumentoCarpeta';
import SubirDocumentoModal from '@/components/usuarios/SubirDocumentoModal';
import { useUsuario } from '@/lib/hooks/useUsuarios';
import {
  useDocumentosUsuario,
  useSubirDocumento,
  useEliminarDocumento,
} from '@/lib/hooks/useDocumentosUsuario';
import {
  TipoDocumentoUsuario,
  type DocumentoUsuario,
} from '@/lib/api/documentos-usuario';
import { ArrowLeft, FolderOpen, Upload, Plus } from 'lucide-react';

const tipoLabels: Record<TipoDocumentoUsuario, string> = {
  [TipoDocumentoUsuario.FIRMA]: 'Firma del Compromiso',
  [TipoDocumentoUsuario.ANTECEDENTES_PENALES]: 'Antecedentes Penales',
  [TipoDocumentoUsuario.EXAMEN_PROTECCION]: 'Examen de Protección',
  [TipoDocumentoUsuario.VACACIONES]: 'Vacaciones',
  [TipoDocumentoUsuario.LICENCIAS]: 'Licencias',
  [TipoDocumentoUsuario.SUSPENSION]: 'Suspensión',
  [TipoDocumentoUsuario.AMONESTACION]: 'Amonestación',
  [TipoDocumentoUsuario.OTRO]: 'Otro',
};

const tiposOptions = Object.values(TipoDocumentoUsuario).map((value) => ({
  value,
  label: tipoLabels[value],
}));

export default function UsuarioDocumentosPage() {
  const params = useParams();
  const router = useRouter();
  const usuarioId = params.id as string;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [tipoPreseleccionado, setTipoPreseleccionado] = useState<TipoDocumentoUsuario | undefined>();
  const [docToDelete, setDocToDelete] = useState<DocumentoUsuario | null>(null);

  const { data: usuario, isLoading: loadingUsuario } = useUsuario(usuarioId);
  const { data: documentos = [], isLoading: loadingDocs } = useDocumentosUsuario(usuarioId);
  const subirMutation = useSubirDocumento(usuarioId);
  const eliminarMutation = useEliminarDocumento(usuarioId);

  const documentosPorTipo = useMemo(() => {
    const grouped: Record<string, DocumentoUsuario[]> = {};
    Object.values(TipoDocumentoUsuario).forEach((tipo) => {
      grouped[tipo] = documentos.filter((d) => d.tipo_documento === tipo);
    });
    return grouped;
  }, [documentos]);

  const handleSubir = async (formData: FormData) => {
    await subirMutation.mutateAsync(formData);
  };

  const handleSubirFromFolder = (tipo: TipoDocumentoUsuario) => {
    setTipoPreseleccionado(tipo);
    setShowUploadModal(true);
  };

  const handleOpenUploadGeneral = () => {
    setTipoPreseleccionado(undefined);
    setShowUploadModal(true);
  };

  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    eliminarMutation.mutate(docToDelete.id, {
      onSuccess: () => setDocToDelete(null),
    });
  };

  const isLoading = loadingUsuario || loadingDocs;

  return (
    <ProtectedRoute requiredPermiso="usuarios:ver">
      <DashboardLayout>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !usuario ? (
          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard/usuarios')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Usuarios
            </button>
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Usuario no encontrado</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard/usuarios')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-6 h-6 text-amber-500" />
                    <h1 className="text-2xl font-bold text-gray-900">
                      Documentos de {usuario.nombre}
                    </h1>
                  </div>
                  <p className="text-gray-600 mt-1 ml-9">{usuario.correo}</p>
                </div>
              </div>
              <Button
                onClick={handleOpenUploadGeneral}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                Subir Documento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(documentosPorTipo).map(([tipo, docs]) => (
                <DocumentoCarpeta
                  key={tipo}
                  tipo={tipo as TipoDocumentoUsuario}
                  documentos={docs}
                  onSubir={handleSubirFromFolder}
                  onEliminar={setDocToDelete}
                />
              ))}
            </div>
          </div>
        )}

        <SubirDocumentoModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setTipoPreseleccionado(undefined);
          }}
          onSubmit={handleSubir}
          tiposDocumento={tiposOptions}
          tipoPreseleccionado={tipoPreseleccionado}
        />

        <Modal
          isOpen={!!docToDelete}
          onClose={() => setDocToDelete(null)}
          title="Confirmar Eliminación"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar el documento{' '}
              <strong>{docToDelete?.nombre_original}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDocToDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                isLoading={eliminarMutation.isPending}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
