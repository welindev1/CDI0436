'use client';

import { Trophy, User, Users } from 'lucide-react';
import { Club } from '@/lib/types';

interface ClubInfoProps {
  club: Club;
}

export default function ClubInfo({ club }: ClubInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-indigo-600" />
        Información General
      </h2>

      <div className="space-y-3">
        {club.descripcion && (
          <div>
            <p className="text-sm font-medium text-gray-700">Descripción</p>
            <p className="text-gray-600">{club.descripcion}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
            <User className="w-4 h-4" />
            Tutor
          </p>
          <p className="text-gray-600">
            {club.tutor
              ? `${club.tutor.nombre} ${club.tutor.apellido || ''}`
              : 'Sin tutor asignado'}
          </p>
          {club.tutor?.especialidad && (
            <p className="text-sm text-gray-500">{club.tutor.especialidad}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" />
            Capacidad
          </p>
          <p className="text-gray-600">
            {club.beneficiarios?.length || 0}
            {club.capacidad_maxima > 0 && ` / ${club.capacidad_maxima}`} inscrito(s)
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Estado</p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              club.activo
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {club.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
    </div>
  );
}
