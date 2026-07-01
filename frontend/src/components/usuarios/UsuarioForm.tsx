'use client';

import { Wand2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type { Rol, Usuario, UsuarioFormValues } from '@/lib/types';

interface UsuarioFormProps {
  showModal: boolean;
  editingUsuario: Usuario | null;
  formData: UsuarioFormValues;
  formError: string;
  roles: Rol[];
  onClose: () => void;
  onChange: (data: UsuarioFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGeneratePassword: () => void;
}

export function UsuarioForm({
  showModal,
  editingUsuario,
  formData,
  formError,
  roles,
  onClose,
  onChange,
  onSubmit,
  onGeneratePassword,
}: UsuarioFormProps) {
  return (
    <Modal
      isOpen={showModal}
      onClose={onClose}
      title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {formError && <Alert variant="error">{formError}</Alert>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
          <input
            type="email"
            value={formData.correo}
            onChange={(e) => onChange({ ...formData, correo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {!editingUsuario && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => onChange({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={onGeneratePassword}
              className="absolute right-2 top-8 p-1 text-gray-400 hover:text-blue-600"
              title="Generar y copiar contraseña"
            >
              <Wand2 className="w-5 h-5" />
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            value={formData.rol_id}
            onChange={(e) => onChange({ ...formData, rol_id: e.target.value })}
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {editingUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
