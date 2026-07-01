'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import TutorForm from '@/components/tutores/TutorForm';
import TutorTable from '@/components/tutores/TutorTable';
import TutorFilters from '@/components/tutores/TutorFilters';
import {
  useTutores,
  useCreateTutor,
  useUpdateTutor,
  useDeleteTutor,
  useDesactivarTutor,
} from '@/lib/hooks';
import { Tutor } from '@/lib/types';
import { Plus, UserCircle, UserX } from 'lucide-react';

export default function TutoresPage() {
  const { data: tutores = [], isLoading, error: loadError } = useTutores();
  const createTutor = useCreateTutor();
  const updateTutor = useUpdateTutor();
  const deleteTutor = useDeleteTutor();
  const desactivarTutor = useDesactivarTutor();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tutorToDelete, setTutorToDelete] = useState<string | null>(null);
  const [pageError, setPageError] = useState('');

  const error = loadError || pageError;

  const filteredTutores = useMemo(() =>
    tutores.filter(t =>
      t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.correo?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [tutores, searchTerm]
  );

  const handleCreate = () => {
    setSelectedTutor(undefined);
    setShowModal(true);
  };

  const handleEdit = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Tutor>) => {
    try {
      if (selectedTutor) {
        await updateTutor.mutateAsync({ id: selectedTutor.id, data });
      } else {
        await createTutor.mutateAsync(data);
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
    setTutorToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!tutorToDelete) return;

    try {
      await deleteTutor.mutateAsync(tutorToDelete);
      setShowDeleteConfirm(false);
      setTutorToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al eliminar tutor';
      setPageError(msg);
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      await desactivarTutor.mutateAsync(id);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al desactivar tutor';
      setPageError(msg);
    }
  };

  return (
    <ProtectedRoute requiredPermisos={['tutores:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tutores</h1>
              <p className="text-gray-600 mt-1">Gestión de tutores del programa</p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Plus className="w-5 h-5" />
              Nuevo Tutor
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{tutores.length}</p>
                </div>
                <UserCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tutores.filter(t => t.activo).length}
                  </p>
                </div>
                <UserCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {tutores.filter(t => !t.activo).length}
                  </p>
                </div>
                <UserX className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error instanceof Error ? error.message : 'Error al cargar'}
            </Alert>
          )}

          {/* Search */}
          <TutorFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          {/* Table */}
          <TutorTable
            tutores={filteredTutores}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDesactivar={handleDesactivar}
            onDelete={handleDeleteClick}
            onCreate={handleCreate}
          />
        </div>

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedTutor ? 'Editar Tutor' : 'Nuevo Tutor'}
          size="lg"
        >
          <TutorForm
            tutor={selectedTutor}
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
              ¿Estás seguro de que deseas eliminar este tutor? Esta acción no se puede deshacer.
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
