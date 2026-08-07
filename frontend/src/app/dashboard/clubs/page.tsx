'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import ClubForm from '@/components/clubs/ClubForm';
import ClubList from '@/components/clubs/ClubList';
import { useAuth } from '@/contexts/AuthContext';
import {
  useClubs,
  useCreateClub,
  useUpdateClub,
  useDeleteClub,
} from '@/lib/hooks';
import { Club } from '@/lib/types';
import {
  Plus,
  Search,
  Trophy,
  Users,
} from 'lucide-react';

export default function ClubsPage() {
  const { tienePermiso } = useAuth();
  const { data: clubes = [], isLoading, error: loadError } = useClubs();
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<string | null>(null);
  const [pageError, setPageError] = useState('');

  const error = loadError || pageError;
  const puedeCrear = tienePermiso('clubs:crear');
  const puedeEditar = tienePermiso('clubs:editar');
  const puedeEliminar = tienePermiso('clubs:eliminar');

  const filteredClubes = useMemo(() =>
    clubes.filter(c =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [clubes, searchTerm]
  );

  const handleCreate = () => {
    setSelectedClub(undefined);
    setShowModal(true);
  };

  const handleEdit = (club: Club) => {
    setSelectedClub(club);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Club>) => {
    try {
      if (selectedClub) {
        await updateClub.mutateAsync({ id: selectedClub.id, data });
      } else {
        await createClub.mutateAsync(data);
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
    setClubToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!clubToDelete) return;

    try {
      await deleteClub.mutateAsync(clubToDelete);
      setShowDeleteConfirm(false);
      setClubToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al eliminar club';
      setPageError(msg);
    }
  };

  return (
    <ProtectedRoute requiredPermisos={['clubs:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-indigo-600" />
                Clubs
              </h1>
              <p className="text-gray-600 mt-1">Gestión de clubs y actividades</p>
            </div>
            {puedeCrear && (
              <Button onClick={handleCreate} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Plus className="w-5 h-5" />
                Nuevo Club
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clubs</p>
                  <p className="text-2xl font-bold text-gray-900">{clubes.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clubs Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {clubes.filter(c => c.activo).length}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Inscritos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {clubes.reduce((acc, c) => acc + (c.beneficiarios?.length || 0), 0)}
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

          <ClubList
            clubes={filteredClubes}
            isLoading={isLoading}
            puedeEditar={puedeEditar}
            puedeEliminar={puedeEliminar}
            puedeCrear={puedeCrear}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onCreate={handleCreate}
          />
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedClub ? 'Editar Club' : 'Nuevo Club'}
          size="lg"
        >
          <ClubForm
            club={selectedClub}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>

        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirmar Eliminación"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar este club? Esta acción no se puede deshacer.
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
