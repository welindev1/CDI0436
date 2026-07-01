'use client';

import { Check } from 'lucide-react';
import type { Permiso } from '@/lib/types';

interface PermisosGridProps {
  permisosAgrupados: Record<string, Permiso[]>;
  selectedPermisosIds: string[];
  onTogglePermiso: (permisoId: string) => void;
  onToggleModulo: (modulo: string) => void;
}

function formatModuloNombre(modulo: string): string {
  return modulo.charAt(0).toUpperCase() + modulo.slice(1);
}

export default function PermisosGrid({
  permisosAgrupados,
  selectedPermisosIds,
  onTogglePermiso,
  onToggleModulo,
}: PermisosGridProps) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {Object.entries(permisosAgrupados).map(([modulo, permisos]) => {
        const todosSeleccionados = permisos.every((p) =>
          selectedPermisosIds.includes(p.id)
        );
        const algunoSeleccionado = permisos.some((p) =>
          selectedPermisosIds.includes(p.id)
        );

        return (
          <div
            key={modulo}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => onToggleModulo(modulo)}
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
                    checked={selectedPermisosIds.includes(permiso.id)}
                    onChange={() => onTogglePermiso(permiso.id)}
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
  );
}
