'use client';

import { Shield, User, Users } from 'lucide-react';
import { Supervivencia } from '@/lib/types';

interface SupervivenciaInfoProps {
  supervivencia: Supervivencia;
}

export default function SupervivenciaInfo({ supervivencia }: SupervivenciaInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-orange-600" />
        Información General
      </h2>

      <div className="space-y-3">
        {supervivencia.descripcion && (
          <div>
            <p className="text-sm font-medium text-gray-700">Descripción</p>
            <p className="text-gray-600">{supervivencia.descripcion}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
            <User className="w-4 h-4" />
            Profesor/Tutor
          </p>
          <p className="text-gray-600">
            {supervivencia.tutor
              ? `${supervivencia.tutor.nombre} ${supervivencia.tutor.apellido || ''}`
              : 'Sin profesor asignado'}
          </p>
          {supervivencia.tutor?.especialidad && (
            <p className="text-sm text-gray-500">{supervivencia.tutor.especialidad}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" />
            Capacidad
          </p>
          <p className="text-gray-600">
            {supervivencia.beneficiarios?.length || 0}
            {supervivencia.capacidad_maxima > 0 && ` / ${supervivencia.capacidad_maxima}`} inscrito(s)
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Estado</p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              supervivencia.activo
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {supervivencia.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
    </div>
  );
}
