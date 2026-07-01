'use client';

import Link from 'next/link';
import { Supervivencia } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Shield, Users, User, Eye, Edit, Trash2 } from 'lucide-react';

interface SupervivenciaTableProps {
  supervivencias: Supervivencia[];
  isLoading: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeCrear: boolean;
  onEdit: (supervivencia: Supervivencia) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export default function SupervivenciaTable({
  supervivencias,
  isLoading,
  puedeEditar,
  puedeEliminar,
  puedeCrear,
  onEdit,
  onDelete,
  onCreate,
}: SupervivenciaTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (supervivencias.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron cursos de supervivencia</p>
          {puedeCrear && (
            <Button onClick={onCreate} className="mt-4">
              Crear Primer Curso
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {supervivencias.map((supervivencia) => (
          <div key={supervivencia.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{supervivencia.nombre}</h3>
                {supervivencia.codigo && (
                  <p className="text-sm text-gray-500">Código: {supervivencia.codigo}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                supervivencia.activo
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {supervivencia.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* Descripción */}
            {supervivencia.descripcion && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {supervivencia.descripcion}
              </p>
            )}

            {/* Info */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {supervivencia.tutor
                    ? `${supervivencia.tutor.nombre} ${supervivencia.tutor.apellido || ''}`
                    : 'Sin profesor'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {supervivencia.beneficiarios?.length || 0} inscrito(s)
                  {supervivencia.capacidad_maxima > 0 && ` / ${supervivencia.capacidad_maxima}`}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
              <Link href={`/dashboard/supervivencia/${supervivencia.id}`} className="flex-1">
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
                  onClick={() => onEdit(supervivencia)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {puedeEliminar && (
                <button
                  onClick={() => onDelete(supervivencia.id)}
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
