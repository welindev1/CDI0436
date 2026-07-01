'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getRoles } from '@/lib/api/roles';
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario, useResetPassword } from '@/lib/hooks';
import { UsuarioTable } from '@/components/usuarios/UsuarioTable';
import { UsuarioForm } from '@/components/usuarios/UsuarioForm';
import { UsuarioFilters } from '@/components/usuarios/UsuarioFilters';
import { Plus, Users, UserCheck, UserX, Wand2 } from 'lucide-react';
import type { Usuario, Rol } from '@/lib/types';

export default function UsuariosPage() {
  const { tienePermiso } = useAuth();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [resetPasswordUsuario, setResetPasswordUsuario] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({ nombre: '', correo: '', password: '', rol_id: '' });
  const [formError, setFormError] = useState('');

  // Hooks
  const { data: usuarios = [], isLoading } = useUsuarios();
  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();
  const deleteUsuario = useDeleteUsuario();
  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    getRoles()
      .then((rolesData) => setRoles(rolesData.filter((r: Rol) => r.activo)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error al cargar roles'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingUsuario) {
        await updateUsuario.mutateAsync({
          id: editingUsuario.id,
          data: { nombre: formData.nombre, correo: formData.correo, rol_id: formData.rol_id },
        });
      } else {
        await createUsuario.mutateAsync(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar usuario');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUsuario || !newPassword) return;

    resetPasswordMutation.mutate(
      { id: resetPasswordUsuario.id, password: newPassword },
      {
        onSuccess: () => {
          setShowPasswordModal(false);
          setResetPasswordUsuario(null);
          setNewPassword('');
        },
        onError: (err: Error) => {
          setFormError(err.message || 'Error al cambiar contraseña');
        },
      }
    );
  };

  const handleDelete = async () => {
    if (!usuarioToDelete) return;
    deleteUsuario.mutate(usuarioToDelete.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setUsuarioToDelete(null);
      },
      onError: (err: Error) => {
        setError(err.message || 'Error al eliminar usuario');
      },
    });
  };

  const openEditModal = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({ nombre: usuario.nombre, correo: usuario.correo, password: '', rol_id: usuario.rol_id || '' });
    setFormError('');
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ nombre: '', correo: '', password: '', rol_id: '' });
    setEditingUsuario(null);
    setFormError('');
  };

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  };

  const handleGeneratePassword = (field: 'create' | 'reset') => {
    const password = generatePassword();
    if (field === 'create') {
      setFormData((prev) => ({ ...prev, password }));
    } else {
      setNewPassword(password);
    }
    navigator.clipboard.writeText(password);
    alert('Contraseña generada y copiada al portapapeles: ' + password);
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
              <p className="text-gray-600 mt-1">Gestión de usuarios del sistema</p>
            </div>
            {tienePermiso('usuarios:crear') && (
              <Button onClick={openCreateModal} className="flex items-center gap-2 w-full sm:w-auto justify-center">
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
                  <p className="text-2xl font-bold text-green-600">{usuarios.filter((u) => u.activo).length}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-600">{usuarios.filter((u) => !u.activo).length}</p>
                </div>
                <UserX className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <UsuarioFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <UsuarioTable
            usuarios={filteredUsuarios}
            loading={isLoading}
            searchTerm={searchTerm}
            hasCreatePermission={tienePermiso('usuarios:crear')}
            hasEditPermission={tienePermiso('usuarios:editar')}
            hasDeletePermission={tienePermiso('usuarios:eliminar')}
            onEdit={openEditModal}
            onDelete={(usuario) => { setUsuarioToDelete(usuario); setShowDeleteConfirm(true); }}
            onResetPassword={(usuario) => { setResetPasswordUsuario(usuario); setNewPassword(''); setFormError(''); setShowPasswordModal(true); }}
            onCreate={openCreateModal}
          />
        </div>

        {/* Modal Crear/Editar Usuario */}
        <UsuarioForm
          showModal={showModal}
          editingUsuario={editingUsuario}
          formData={formData}
          formError={formError}
          roles={roles}
          onClose={() => setShowModal(false)}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onGeneratePassword={() => handleGeneratePassword('create')}
        />

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

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => handleGeneratePassword('reset')}
                className="absolute right-2 top-8 p-1 text-gray-400 hover:text-blue-600"
                title="Generar y copiar contraseña"
              >
                <Wand2 className="w-5 h-5" />
              </button>
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
