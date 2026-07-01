'use client';

import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PermisosGrid from './PermisosGrid';
import { Rol, Permiso } from '@/lib/types';

interface RolFormData {
  nombre: string;
  descripcion: string;
  permisos_ids: string[];
}

interface RolFormProps {
  editingRol: Rol | null;
  formError: string;
  permisosAgrupados: Record<string, Permiso[]>;
  formData: RolFormData;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onChange: (data: RolFormData) => void;
  onTogglePermiso: (permisoId: string) => void;
  onToggleModulo: (modulo: string) => void;
}

export default function RolForm({
  editingRol,
  formError,
  permisosAgrupados,
  formData,
  onSubmit,
  onCancel,
  onChange,
  onTogglePermiso,
  onToggleModulo,
}: RolFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {formError && <Alert variant="error">{formError}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Rol
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
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
            onChange={(e) => onChange({ ...formData, descripcion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Permisos
        </label>
        <PermisosGrid
          permisosAgrupados={permisosAgrupados}
          selectedPermisosIds={formData.permisos_ids}
          onTogglePermiso={onTogglePermiso}
          onToggleModulo={onToggleModulo}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingRol ? 'Guardar Cambios' : 'Crear Rol'}
        </Button>
      </div>
    </form>
  );
}
