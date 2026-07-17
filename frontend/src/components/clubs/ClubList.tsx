'use client';

import Link from 'next/link';
import { Club } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Trophy, Users, User, Eye, Edit, Trash2 } from 'lucide-react';

interface ClubListProps {
  clubes: Club[];
  isLoading: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeCrear: boolean;
  onEdit: (club: Club) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export default function ClubList({
  clubes,
  isLoading,
  puedeEditar,
  puedeEliminar,
  puedeCrear,
  onEdit,
  onDelete,
  onCreate,
}: ClubListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (clubes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron clubs</p>
          {puedeCrear && (
            <Button onClick={onCreate} className="mt-4">
              Crear Primer Club
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {clubes.map((club) => (
          <div key={club.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{club.nombre}</h3>
                {club.codigo && (
                  <p className="text-sm text-gray-500">Código: {club.codigo}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                club.activo
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {club.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {club.descripcion && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {club.descripcion}
              </p>
            )}

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {club.tutor
                    ? `${club.tutor.nombre} ${club.tutor.apellido || ''}`
                    : 'Sin tutor'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {club.beneficiarios?.length || 0} inscrito(s)
                  {club.capacidad_maxima > 0 && ` / ${club.capacidad_maxima}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
              <Link href={`/dashboard/clubs/${club.id}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  size="sm"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalle
                </Button>
              </Link>
              {puedeEditar && (
                <button
                  onClick={() => onEdit(club)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {puedeEliminar && (
                <button
                  onClick={() => onDelete(club.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
