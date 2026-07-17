'use client';

import { Club } from '@/lib/types';

interface ClubStatsProps {
  club: Club;
}

export default function ClubStats({ club }: ClubStatsProps) {
  const totalInscritos = club.beneficiarios?.length || 0;
  const cuposDisponibles = club.capacidad_maxima > 0
    ? club.capacidad_maxima - totalInscritos
    : 0;
  const porcentajeOcupacion = club.capacidad_maxima > 0
    ? Math.round((totalInscritos / club.capacidad_maxima) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
          <span className="text-sm font-medium text-indigo-900">Total Inscritos</span>
          <span className="text-2xl font-bold text-indigo-600">{totalInscritos}</span>
        </div>

        {club.capacidad_maxima > 0 && (
          <>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-900">Cupos Disponibles</span>
              <span className="text-2xl font-bold text-green-600">{cuposDisponibles}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-900">% Ocupación</span>
              <span className="text-2xl font-bold text-purple-600">{porcentajeOcupacion}%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
