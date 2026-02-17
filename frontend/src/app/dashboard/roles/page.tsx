'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/contexts/AuthContext';
import {
  getRoles,
  createRol,
  updateRol,
  deleteRol,
  getPermisosAgrupados,
} from '@/lib/api/roles';
import { Plus, Edit, Trash2, Shield, Check, ShieldCheck, ShieldX } from 'lucide-react';

interface Permiso {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  accion: string;
  descripcion: string;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  es_super_admin: boolean;
  activo: boolean;
  permisos: Permiso[];
}

export default function RolesPage() {
  const { tienePermiso } = useAuth();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisosAgrupados, setPermisosAgrupados] = useState<Record<string, Permiso[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [rolesData, permisosData] = await Promise.all([
        getRoles(),
        getPermisosAgrupados(),
      ]);
      setRoles(rolesData);
      setPermisosAgrupados(permisosData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingRol) {
        await updateRol(editingRol.id, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          permisos_ids: formData.permisos_ids,
        });
      } else {
        await createRol(formData);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al guardar rol');
    }
  };

  const handleDeleteClick = (rol: Rol) => {
    setRolToDelete(rol);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!rolToDelete) return;

    try {
      await deleteRol(rolToDelete.id);
      setShowDeleteConfirm(false);
      setRolToDelete(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar rol');
    }
  };

  const openEditModal = (rol: Rol) => {
    setEditingRol(rol);
    setFormData({
      nombre: rol.nombre,
      descripcion: rol.descripcion || '',
      permisos_ids: rol.permisos.map((p) => p.id),
    });
    setFormError('');
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', permisos_ids: [] });
    setEditingRol(null);
    setFormError('');
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

  const formatModuloNombre = (modulo: string): string => {
    return modulo.charAt(0).toUpperCase() + modulo.slice(1);
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
              {error}
            </Alert>
          )}

          {/* Roles Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : roles.length === 0 ? (
            <div className="bg-white rounded-lg shadow text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No hay roles creados</p>
              {tienePermiso('roles:crear') && (
                <Button onClick={openCreateModal}>Crear Primer Rol</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((rol) => (
                <div
                  key={rol.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            rol.es_super_admin ? 'bg-purple-100' : 'bg-blue-100'
                          }`}
                        >
                          <Shield
                            className={`w-5 h-5 ${
                              rol.es_super_admin ? 'text-purple-600' : 'text-blue-600'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{rol.nombre}</h3>
                          {rol.es_super_admin && (
                            <span className="inline-block text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                              Super Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {!rol.es_super_admin && (
                        <div className="flex items-center gap-1">
                          {tienePermiso('roles:editar') && (
                            <button
                              onClick={() => openEditModal(rol)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {tienePermiso('roles:eliminar') && (
                            <button
                              onClick={() => handleDeleteClick(rol)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {rol.descripcion && (
                      <p className="mt-3 text-sm text-gray-600">{rol.descripcion}</p>
                    )}

                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                        Permisos ({rol.es_super_admin ? 'Todos' : rol.permisos.length})
                      </p>
                      {rol.es_super_admin ? (
                        <p className="text-sm text-purple-600">
                          Acceso completo a todas las funcionalidades
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {rol.permisos.slice(0, 5).map((permiso) => (
                            <span
                              key={permiso.id}
                              className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {permiso.nombre}
                            </span>
                          ))}
                          {rol.permisos.length > 5 && (
                            <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              +{rol.permisos.length - 5} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rol.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rol.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Crear/Editar Rol */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingRol ? 'Editar Rol' : 'Nuevo Rol'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && <Alert variant="error">{formError}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permisos
              </label>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(permisosAgrupados).map(([modulo, permisos]) => {
                  const todosSeleccionados = permisos.every((p) =>
                    formData.permisos_ids.includes(p.id)
                  );
                  const algunoSeleccionado = permisos.some((p) =>
                    formData.permisos_ids.includes(p.id)
                  );

                  return (
                    <div
                      key={modulo}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleModulo(modulo)}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            todosSeleccionados
                              ? 'bg-blue-600 border-blue-600'
                              : algunoSeleccionado
                              ? 'bg-blue-200 border-blue-400'
                              : 'border-gray-300'
                          }`}
                        >
                          {todosSeleccionados && <Check className="w-3 h-3 text-white" />}
                          {!todosSeleccionados && algunoSeleccionado && (
                            <div className="w-2 h-2 bg-blue-600 rounded-sm" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatModuloNombre(modulo)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({permisos.length} permisos)
                        </span>
                      </div>

                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permisos.map((permiso) => (
                          <label
                            key={permiso.id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permisos_ids.includes(permiso.id)}
                              onChange={() => togglePermiso(permiso.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {permiso.nombre}
                              </p>
                              <p className="text-xs text-gray-500">{permiso.descripcion}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingRol ? 'Guardar Cambios' : 'Crear Rol'}
              </Button>
            </div>
          </form>
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
