'use client';

import Link from 'next/link';
import { Clase } from '@/lib/types';
import Button from '@/components/ui/Button';
import { BookOpen, Users, Calendar, UserCircle, Eye, Edit, Trash2 } from 'lucide-react';

interface ClaseListProps {
  clases: Clase[];
  isLoading: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeCrear: boolean;
  onEdit: (clase: Clase) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  diasLabel: Record<string, string>;
  getTurnoLabel: (hora_inicio: string) => string;
}

export default function ClaseList({
  clases,
  isLoading,
  puedeEditar,
  puedeEliminar,
  puedeCrear,
  onEdit,
  onDelete,
  onCreate,
  diasLabel,
  getTurnoLabel,
}: ClaseListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (clases.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron clases</p>
          {puedeCrear && (
            <Button onClick={onCreate} className="mt-4">
              Crear Primera Clase
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {clases.map((clase) => (
          <div key={clase.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{clase.nombre}</h3>
                {clase.codigo && (
                  <p className="text-sm text-gray-500">Código: {clase.codigo}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                clase.activo
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {clase.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            {/* Descripción */}
            {clase.descripcion && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {clase.descripcion}
              </p>
            )}

            {/* Info del tutor */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {clase.tutor?.nombre} {clase.tutor?.apellido}
                </span>
              </div>

              {/* Horarios */}
              {clase.horarios?.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">
                    {diasLabel[h.dia] || h.dia} - {getTurnoLabel(h.hora_inicio)}
                  </span>
                </div>
              ))}

              {/* Inscritos */}
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {clase.beneficiarios?.length || 0} inscrito(s)
                  {clase.capacidad_maxima > 0 && ` / ${clase.capacidad_maxima}`}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
              <Link href={`/dashboard/clases/${clase.id}`} className="flex-1">
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
                  onClick={() => onEdit(clase)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {puedeEliminar && (
                <button
                  onClick={() => onDelete(clase.id)}
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
