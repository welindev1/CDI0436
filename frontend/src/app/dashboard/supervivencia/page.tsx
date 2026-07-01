'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import SupervivenciaForm from '@/components/supervivencia/SupervivenciaForm';
import SupervivenciaTable from '@/components/supervivencia/SupervivenciaTable';
import { useAuth } from '@/contexts/AuthContext';
import {
  useSupervivencias,
  useCreateSupervivencia,
  useUpdateSupervivencia,
  useDeleteSupervivencia,
} from '@/lib/hooks';
import { Supervivencia } from '@/lib/types';
import {
  Plus,
  Search,
  Shield,
  Users,
} from 'lucide-react';

export default function SupervivenciaPage() {
  const { tienePermiso } = useAuth();
  const { data: supervivencias = [], isLoading, error: loadError } = useSupervivencias();
  const createSupervivencia = useCreateSupervivencia();
  const updateSupervivencia = useUpdateSupervivencia();
  const deleteSupervivencia = useDeleteSupervivencia();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupervivencia, setSelectedSupervivencia] = useState<Supervivencia | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supervivenciaToDelete, setSupervivenciaToDelete] = useState<string | null>(null);
  const [pageError, setPageError] = useState('');

  const error = loadError || pageError;
  const puedeCrear = tienePermiso('supervivencia:crear');
  const puedeEditar = tienePermiso('supervivencia:editar');
  const puedeEliminar = tienePermiso('supervivencia:eliminar');

  const filteredSupervivencias = useMemo(() =>
    supervivencias.filter(s =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [supervivencias, searchTerm]
  );

  const handleCreate = () => {
    setSelectedSupervivencia(undefined);
    setShowModal(true);
  };

  const handleEdit = (supervivencia: Supervivencia) => {
    setSelectedSupervivencia(supervivencia);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Supervivencia>) => {
    try {
      if (selectedSupervivencia) {
        await updateSupervivencia.mutateAsync({ id: selectedSupervivencia.id, data });
      } else {
        await createSupervivencia.mutateAsync(data);
      }
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al guardar';
      throw new Error(msg);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSupervivenciaToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!supervivenciaToDelete) return;

    try {
      await deleteSupervivencia.mutateAsync(supervivenciaToDelete);
      setShowDeleteConfirm(false);
      setSupervivenciaToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al eliminar curso';
      setPageError(msg);
    }
  };

  return (
    <ProtectedRoute requiredPermisos={['supervivencia:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-8 h-8 text-orange-600" />
                Supervivencia
              </h1>
              <p className="text-gray-600 mt-1">Cursos de supervivencia y capacitaciones</p>
            </div>
            {puedeCrear && (
              <Button onClick={handleCreate} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Plus className="w-5 h-5" />
                Nuevo Curso
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cursos</p>
                  <p className="text-2xl font-bold text-gray-900">{supervivencias.length}</p>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cursos Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {supervivencias.filter(s => s.activo).length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Inscritos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {supervivencias.reduce((acc, s) => acc + (s.beneficiarios?.length || 0), 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error instanceof Error ? error.message : 'Error al cargar'}
            </Alert>
          )}

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lista de Cursos */}
          <SupervivenciaTable
            supervivencias={filteredSupervivencias}
            isLoading={isLoading}
            puedeEditar={puedeEditar}
            puedeEliminar={puedeEliminar}
            puedeCrear={puedeCrear}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onCreate={handleCreate}
          />
        </div>

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedSupervivencia ? 'Editar Curso' : 'Nuevo Curso de Supervivencia'}
          size="lg"
        >
          <SupervivenciaForm
            supervivencia={selectedSupervivencia}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>

        {/* Modal Confirmar Eliminación */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirmar Eliminación"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
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
