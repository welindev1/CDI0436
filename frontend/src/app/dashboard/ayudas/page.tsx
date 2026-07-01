'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { useAyudas, useUpdateEstadoAyuda, useDeleteAyuda, useComentariosAyuda, useCreateComentarioAyuda, useUpdateFotoEntregaAyuda, useExportAyudas } from '@/lib/hooks';
import { AyudaStats } from '@/components/ayudas/AyudaStats';
import { AyudaFilters } from '@/components/ayudas/AyudaFilters';
import { AyudaCard } from '@/components/ayudas/AyudaCard';
import { AyudaComentarios } from '@/components/ayudas/AyudaComentarios';
import { AyudaModal } from '@/components/ayudas/AyudaModal';
import { Loader2 } from 'lucide-react';
import type { Ayuda, EstadoFiltroAyuda } from '@/lib/types';

export default function AyudasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltroAyuda>('pendiente');
  const [fotoModal, setFotoModal] = useState<string | null>(null);
  const [detalleHover, setDetalleHover] = useState<{ id: string; x: number; y: number } | null>(null);

  // Comentarios
  const [comentariosModal, setComentariosModal] = useState<Ayuda | null>(null);

  // Foto entrega
  const [fotoEntregaModal, setFotoEntregaModal] = useState<Ayuda | null>(null);
  const [fotoEntregaPreview, setFotoEntregaPreview] = useState<string | null>(null);
  const [fotoEntregaModalView, setFotoEntregaModalView] = useState<string | null>(null);

  // Hooks
  const { data: ayudas = [], isLoading, error } = useAyudas();
  const updateEstado = useUpdateEstadoAyuda();
  const deleteAyuda = useDeleteAyuda();
  const { data: comentarios = [], isLoading: loadingComentarios } = useComentariosAyuda(comentariosModal?.id ?? '');
  const createComentario = useCreateComentarioAyuda();
  const updateFotoEntrega = useUpdateFotoEntregaAyuda();
  const exportAyudas = useExportAyudas();

  // Computed
  const countByEstado = useMemo(() => ({
    pendiente: ayudas.filter((a) => a.estado === 'pendiente').length,
    aprobada: ayudas.filter((a) => a.estado === 'aprobada').length,
    rechazada: ayudas.filter((a) => a.estado === 'rechazada').length,
    todos: ayudas.length,
  }), [ayudas]);

  const filteredAyudas = useMemo(() =>
    ayudas.filter((a) => {
      const matchSearch =
        a.nombre_beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.codigo_beneficiario.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = estadoFiltro === 'todos' || a.estado === estadoFiltro;
      return matchSearch && matchEstado;
    }),
    [ayudas, searchTerm, estadoFiltro]
  );

  // Handlers
  const handleEstado = async (id: string, estado: 'aprobada' | 'rechazada') => {
    if (!confirm(`¿Estás seguro de ${estado === 'aprobada' ? 'aprobar' : 'rechazar'} esta solicitud?`)) return;
    updateEstado.mutate({ id, estado });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;
    deleteAyuda.mutate(id);
  };

  const handleExport = () => {
    exportAyudas.mutate(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ayudas_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      onError: () => alert('Error al exportar'),
    });
  };

  const handleAddComentario = (contenido: string) => {
    if (!comentariosModal) return;
    createComentario.mutate(
      { ayudaId: comentariosModal.id, data: { contenido, autor: 'Administrador' } },
      { onError: () => alert('Error al agregar comentario') }
    );
  };

  const handleFotoEntregaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Por favor selecciona una imagen válida'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('La imagen no puede ser mayor a 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setFotoEntregaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubirFotoEntrega = () => {
    if (!fotoEntregaPreview || !fotoEntregaModal) return;
    updateFotoEntrega.mutate(
      { id: fotoEntregaModal.id, fotoUrl: fotoEntregaPreview },
      {
        onSuccess: () => { setFotoEntregaModal(null); setFotoEntregaPreview(null); },
        onError: () => alert('Error al subir la foto de entrega'),
      }
    );
  };

  const detailTooltip = detalleHover ? ayudas.find((a) => a.id === detalleHover.id)?.detalle : null;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Solicitudes de Ayuda</h1>
            <p className="text-gray-600 mt-1">Administra las solicitudes registradas por los beneficiarios</p>
          </div>

          {error && <Alert variant="error">{(error as Error)?.message || 'Error al cargar las solicitudes'}</Alert>}

          <AyudaStats {...countByEstado} />

          <AyudaFilters
            estadoFiltro={estadoFiltro}
            onEstadoChange={setEstadoFiltro}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            counts={countByEstado}
            onExport={handleExport}
          />

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Código', 'Beneficiario', 'Teléfono', 'Tipo', 'Detalle', 'Estado', 'Fecha', 'Acciones'].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          h === 'Acciones' ? 'text-right' : ''
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                          <p>Cargando solicitudes...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAyudas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No se encontraron solicitudes {estadoFiltro !== 'todos' ? estadoFiltro + 's' : ''}.
                      </td>
                    </tr>
                  ) : (
                    filteredAyudas.map((ayuda) => (
                      <AyudaCard
                        key={ayuda.id}
                        ayuda={ayuda}
                        onViewFoto={setFotoModal}
                        onOpenComentarios={setComentariosModal}
                        onUploadFotoEntrega={setFotoEntregaModal}
                        onViewFotoEntrega={setFotoEntregaModalView}
                        onAprobar={(id) => handleEstado(id, 'aprobada')}
                        onRechazar={(id) => handleEstado(id, 'rechazada')}
                        onDelete={handleDelete}
                        onDetalleHover={setDetalleHover}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tooltip para detalle */}
        {detalleHover && detailTooltip && (
          <div
            className="fixed z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md text-sm"
            style={{
              left: Math.min(detalleHover.x, window.innerWidth - 400),
              top: detalleHover.y + 8,
            }}
          >
            <p className="font-medium mb-1">Detalle completo:</p>
            <p className="whitespace-pre-wrap">{detailTooltip}</p>
          </div>
        )}

        {/* Modal para comentarios */}
        <Modal
          isOpen={!!comentariosModal}
          onClose={() => {
            setComentariosModal(null);
          }}
          title={comentariosModal ? `Comentarios - ${comentariosModal.nombre_beneficiario}` : 'Comentarios'}
          size="md"
        >
          <AyudaComentarios
            ayuda={comentariosModal}
            comentarios={comentarios}
            loading={loadingComentarios}
            onAddComentario={handleAddComentario}
            onClose={() => setComentariosModal(null)}
          />
        </Modal>

        {/* Modales de fotos */}
        <AyudaModal
          fotoModal={fotoModal}
          onCloseFoto={() => setFotoModal(null)}
          fotoEntregaModal={fotoEntregaModal}
          fotoEntregaPreview={fotoEntregaPreview}
          loadingFotoEntrega={updateFotoEntrega.isPending}
          onFotoEntregaSelect={handleFotoEntregaSelect}
          onSubirFotoEntrega={handleSubirFotoEntrega}
          onCancelFotoEntrega={() => {
            setFotoEntregaModal(null);
            setFotoEntregaPreview(null);
          }}
          fotoEntregaModalView={fotoEntregaModalView}
          onCloseFotoEntregaView={() => setFotoEntregaModalView(null)}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
