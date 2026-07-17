'use client';

import { UserCog, Key, Edit, Trash2, Folder } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import type { Usuario } from '@/lib/types';

interface UsuarioTableProps {
  usuarios: Usuario[];
  loading: boolean;
  searchTerm: string;
  hasCreatePermission: boolean;
  hasEditPermission: boolean;
  hasDeletePermission: boolean;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onResetPassword: (usuario: Usuario) => void;
  onDocuments: (usuario: Usuario) => void;
  onCreate: () => void;
}

export function UsuarioTable({
  usuarios,
  loading,
  searchTerm,
  hasCreatePermission,
  hasEditPermission,
  hasDeletePermission,
  onEdit,
  onDelete,
  onResetPassword,
  onDocuments,
  onCreate,
}: UsuarioTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="text-center py-12">
          <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </p>
          {!searchTerm && hasCreatePermission && (
            <Button onClick={onCreate}>Crear Primer Usuario</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
          {usuarios.map((usuario) => (
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
                  <button
                    onClick={() => onDocuments(usuario)}
                    className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                    title="Documentos"
                  >
                    <Folder className="w-4 h-4" />
                  </button>
                  {hasEditPermission && (
                    <>
                      <button
                        onClick={() => onResetPassword(usuario)}
                        className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                        title="Cambiar contraseña"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(usuario)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {hasDeletePermission && !usuario.rol?.es_super_admin && (
                    <button
                      onClick={() => onDelete(usuario)}
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
    </div>
  );
}
