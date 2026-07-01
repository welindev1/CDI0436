'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import ClaseForm from '@/components/clases/ClaseForm';
import ClaseList from '@/components/clases/ClaseList';
import ClaseFilters from '@/components/clases/ClaseFilters';
import { useAuth } from '@/contexts/AuthContext';
import {
  useClases,
  useCreateClase,
  useUpdateClase,
  useDeleteClase,
} from '@/lib/hooks';
import { Clase } from '@/lib/types';
import {
  Plus,
  BookOpen,
  Users,
} from 'lucide-react';
import { getTurnoLabel } from '@/lib/utils/formatters';

const diasLabel: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

export default function ClasesPage() {
  const { tienePermiso } = useAuth();
  const { data: clases = [], isLoading, error: loadError } = useClases();
  const createClase = useCreateClase();
  const updateClase = useUpdateClase();
  const deleteClase = useDeleteClase();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClase, setSelectedClase] = useState<Clase | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [claseToDelete, setClaseToDelete] = useState<string | null>(null);
  const [pageError, setPageError] = useState('');

  const error = loadError || pageError;
  const puedeCrear = tienePermiso('clases:crear');
  const puedeEditar = tienePermiso('clases:editar');
  const puedeEliminar = tienePermiso('clases:eliminar');

  const filteredClases = useMemo(() =>
    clases.filter(c =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tutor?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [clases, searchTerm]
  );

  const handleCreate = () => {
    setSelectedClase(undefined);
    setShowModal(true);
  };

  const handleEdit = (clase: Clase) => {
    setSelectedClase(clase);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Clase>) => {
    try {
      if (selectedClase) {
        await updateClase.mutateAsync({ id: selectedClase.id, data });
      } else {
        await createClase.mutateAsync(data);
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
    setClaseToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!claseToDelete) return;

    try {
      await deleteClase.mutateAsync(claseToDelete);
      setShowDeleteConfirm(false);
      setClaseToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al eliminar clase';
      setPageError(msg);
    }
  };

  return (
    <ProtectedRoute requiredPermisos={['clases:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clases</h1>
              <p className="text-gray-600 mt-1">Gestión de clases y asignaciones</p>
            </div>
            {puedeCrear && (
              <Button onClick={handleCreate} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Plus className="w-5 h-5" />
                Nueva Clase
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clases</p>
                  <p className="text-2xl font-bold text-gray-900">{clases.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clases Activas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {clases.filter(c => c.activo).length}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Inscritos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {clases.reduce((acc, c) => acc + (c.beneficiarios?.length || 0), 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio/Clase</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {clases.length > 0
                      ? Math.round(clases.reduce((acc, c) => acc + (c.beneficiarios?.length || 0), 0) / clases.length)
                      : 0
                    }
                  </p>
                </div>
                <Users className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error instanceof Error ? error.message : 'Error al cargar las clases'}
            </Alert>
          )}

          {/* Search */}
          <ClaseFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          {/* Lista de Clases */}
          <ClaseList
            clases={filteredClases}
            isLoading={isLoading}
            puedeEditar={puedeEditar}
            puedeEliminar={puedeEliminar}
            puedeCrear={puedeCrear}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onCreate={handleCreate}
            diasLabel={diasLabel}
            getTurnoLabel={getTurnoLabel}
          />
        </div>

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedClase ? 'Editar Clase' : 'Nueva Clase'}
          size="lg"
        >
          <ClaseForm
            clase={selectedClase}
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
              ¿Estás seguro de que deseas eliminar esta clase? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
