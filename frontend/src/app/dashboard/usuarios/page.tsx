'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  resetPassword,
} from '@/lib/api/usuarios';
import { getRoles } from '@/lib/api/roles';
import { Plus, Search, Edit, Trash2, Key, UserCog, Users, UserX, UserCheck } from 'lucide-react';

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: { id: string; nombre: string; es_super_admin: boolean } | null;
  rol_id: string | null;
  activo: boolean;
}

interface Rol {
  id: string;
  nombre: string;
  es_super_admin: boolean;
  activo: boolean;
}

export default function UsuariosPage() {
  const { tienePermiso } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [resetPasswordUsuario, setResetPasswordUsuario] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol_id: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [usuariosData, rolesData] = await Promise.all([
        getUsuarios(),
        getRoles(),
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData.filter((r: Rol) => r.activo));
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
      if (editingUsuario) {
        await updateUsuario(editingUsuario.id, {
          nombre: formData.nombre,
          correo: formData.correo,
          rol_id: formData.rol_id,
        });
      } else {
        await createUsuario(formData);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUsuario || !newPassword) return;

    try {
      await resetPassword(resetPasswordUsuario.id, newPassword);
      setShowPasswordModal(false);
      setResetPasswordUsuario(null);
      setNewPassword('');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const handleDeleteClick = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!usuarioToDelete) return;

    try {
      await deleteUsuario(usuarioToDelete.id);
      setShowDeleteConfirm(false);
      setUsuarioToDelete(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const openEditModal = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      rol_id: usuario.rol_id || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openResetPasswordModal = (usuario: Usuario) => {
    setResetPasswordUsuario(usuario);
    setNewPassword('');
    setFormError('');
    setShowPasswordModal(true);
  };

  const resetForm = () => {
    setFormData({ nombre: '', correo: '', password: '', rol_id: '' });
    setEditingUsuario(null);
    setFormError('');
  };

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermiso="usuarios:ver">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
              <p className="text-gray-600 mt-1">Gestión de usuarios del sistema</p>
            </div>
            {tienePermiso('usuarios:crear') && (
              <Button onClick={openCreateModal} className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nuevo Usuario
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {usuarios.filter((u) => u.activo).length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {usuarios.filter((u) => !u.activo).length}
                  </p>
                </div>
                <UserX className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredUsuarios.length === 0 ? (
              <div className="text-center py-12">
                <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                </p>
                {!searchTerm && tienePermiso('usuarios:crear') && (
                  <Button onClick={openCreateModal}>Crear Primer Usuario</Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell isHeader>Usuario</TableCell>
                    <TableCell isHeader>Rol</TableCell>
                    <TableCell isHeader>Estado</TableCell>
                    <TableCell isHeader>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{usuario.nombre}</p>
                            <p className="text-sm text-gray-500">{usuario.correo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            usuario.rol?.es_super_admin
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {usuario.rol?.nombre || 'Sin rol'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            usuario.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tienePermiso('usuarios:editar') && (
                            <>
                              <button
                                onClick={() => openResetPasswordModal(usuario)}
                                className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                                title="Cambiar contraseña"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(usuario)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {tienePermiso('usuarios:eliminar') && !usuario.rol?.es_super_admin && (
                            <button
                              onClick={() => handleDeleteClick(usuario)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Modal Crear/Editar Usuario */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="error">{formError}</Alert>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
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
                Correo
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {!editingUsuario && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={formData.rol_id}
                onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar rol</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Reset Password */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Cambiar Contraseña"
          size="sm"
        >
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-gray-600">
              Usuario: <strong>{resetPasswordUsuario?.nombre}</strong>
            </p>

            {formError && <Alert variant="error">{formError}</Alert>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
                Cambiar Contraseña
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
              ¿Estás seguro de que deseas eliminar al usuario{' '}
              <strong>{usuarioToDelete?.nombre}</strong>? Esta acción no se puede deshacer.
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
