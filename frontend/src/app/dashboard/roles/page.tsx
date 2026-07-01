'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import RolTable from '@/components/roles/RolTable';
import RolForm from '@/components/roles/RolForm';
import { useAuth } from '@/contexts/AuthContext';
import {
  useRoles,
  usePermisosAgrupados,
  useCreateRol,
  useUpdateRol,
  useDeleteRol,
} from '@/lib/hooks';
import { Rol } from '@/lib/types';
import { Plus, Shield, ShieldCheck, ShieldX } from 'lucide-react';

export default function RolesPage() {
  const { tienePermiso } = useAuth();
  const { data: roles = [], isLoading, error: loadError } = useRoles();
  const { data: permisosAgrupados = {} } = usePermisosAgrupados();
  const createRol = useCreateRol();
  const updateRol = useUpdateRol();
  const deleteRol = useDeleteRol();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [rolToDelete, setRolToDelete] = useState<Rol | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos_ids: [] as string[],
  });
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');

  const error = loadError || pageError;

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', permisos_ids: [] });
    setEditingRol(null);
    setFormError('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (rol: Rol) => {
    setEditingRol(rol);
    setFormData({
      nombre: rol.nombre,
      descripcion: rol.descripcion || '',
      permisos_ids: rol.permisos?.map((p) => p.id) || [],
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingRol) {
        await updateRol.mutateAsync({
          id: editingRol.id,
          data: {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            permisos_ids: formData.permisos_ids,
          },
        });
      } else {
        await createRol.mutateAsync(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al guardar rol';
      setFormError(msg);
    }
  };

  const handleDeleteClick = (rol: Rol) => {
    setRolToDelete(rol);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!rolToDelete) return;

    try {
      await deleteRol.mutateAsync(rolToDelete.id);
      setShowDeleteConfirm(false);
      setRolToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al eliminar rol';
      setPageError(msg);
    }
  };

  const togglePermiso = (permisoId: string) => {
    setFormData((prev) => ({
      ...prev,
      permisos_ids: prev.permisos_ids.includes(permisoId)
        ? prev.permisos_ids.filter((id) => id !== permisoId)
        : [...prev.permisos_ids, permisoId],
    }));
  };

  const toggleModulo = (modulo: string) => {
    const permisosModulo = permisosAgrupados[modulo] || [];
    const permisosIds = permisosModulo.map((p) => p.id);
    const todosSeleccionados = permisosIds.every((id) =>
      formData.permisos_ids.includes(id)
    );

    if (todosSeleccionados) {
      setFormData((prev) => ({
        ...prev,
        permisos_ids: prev.permisos_ids.filter((id) => !permisosIds.includes(id)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permisos_ids: [...new Set([...prev.permisos_ids, ...permisosIds])],
      }));
    }
  };

  return (
    <ProtectedRoute requiredPermiso="roles:ver">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Roles y Permisos</h1>
              <p className="text-gray-600 mt-1">Gestiona los roles y sus permisos de acceso</p>
            </div>
            {tienePermiso('roles:crear') && (
              <Button onClick={openCreateModal} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Plus className="w-5 h-5" />
                Nuevo Rol
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Roles Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {roles.filter((r) => r.activo).length}
                  </p>
                </div>
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Permisos Disponibles</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Object.values(permisosAgrupados).flat().length}
                  </p>
                </div>
                <ShieldX className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error instanceof Error ? error.message : 'Error al cargar'}
            </Alert>
          )}

          {/* Roles Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <RolTable
              roles={roles}
              tienePermiso={tienePermiso}
              onEdit={openEditModal}
              onDelete={handleDeleteClick}
              onCreate={openCreateModal}
            />
          )}
        </div>

        {/* Modal Crear/Editar Rol */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingRol ? 'Editar Rol' : 'Nuevo Rol'}
          size="lg"
        >
          <RolForm
            editingRol={editingRol}
            formError={formError}
            permisosAgrupados={permisosAgrupados}
            formData={formData}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
            onChange={setFormData}
            onTogglePermiso={togglePermiso}
            onToggleModulo={toggleModulo}
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
              ¿Estás seguro de que deseas eliminar el rol{' '}
              <strong>{rolToDelete?.nombre}</strong>? Esta acción no se puede deshacer.
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
