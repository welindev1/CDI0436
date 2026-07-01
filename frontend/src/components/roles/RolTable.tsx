'use client';

import Button from '@/components/ui/Button';
import { Rol } from '@/lib/types';
import { Shield, Edit, Trash2 } from 'lucide-react';

interface RolTableProps {
  roles: Rol[];
  tienePermiso: (permiso: string) => boolean;
  onEdit: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
  onCreate: () => void;
}

export default function RolTable({ roles, tienePermiso, onEdit, onDelete, onCreate }: RolTableProps) {
  if (roles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">No hay roles creados</p>
        {tienePermiso('roles:crear') && (
          <Button onClick={onCreate}>Crear Primer Rol</Button>
        )}
      </div>
    );
  }

  return (
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
                      onClick={() => onEdit(rol)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {tienePermiso('roles:eliminar') && (
                    <button
                      onClick={() => onDelete(rol)}
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
                Permisos ({rol.es_super_admin ? 'Todos' : rol.permisos?.length || 0})
              </p>
              {rol.es_super_admin ? (
                <p className="text-sm text-purple-600">
                  Acceso completo a todas las funcionalidades
                </p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {rol.permisos?.slice(0, 5).map((permiso) => (
                    <span
                      key={permiso.id}
                      className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {permiso.nombre}
                    </span>
                  ))}
                  {(rol.permisos?.length || 0) > 5 && (
                    <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      +{(rol.permisos?.length || 0) - 5} más
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
  );
}
