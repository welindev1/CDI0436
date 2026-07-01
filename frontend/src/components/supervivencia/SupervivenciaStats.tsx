'use client';

import { Supervivencia } from '@/lib/types';

interface SupervivenciaStatsProps {
  supervivencia: Supervivencia;
}

export default function SupervivenciaStats({ supervivencia }: SupervivenciaStatsProps) {
  const totalInscritos = supervivencia.beneficiarios?.length || 0;
  const cuposDisponibles = supervivencia.capacidad_maxima > 0
    ? supervivencia.capacidad_maxima - totalInscritos
    : 0;
  const porcentajeOcupacion = supervivencia.capacidad_maxima > 0
    ? Math.round((totalInscritos / supervivencia.capacidad_maxima) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <span className="text-sm font-medium text-orange-900">Total Inscritos</span>
          <span className="text-2xl font-bold text-orange-600">{totalInscritos}</span>
        </div>

        {supervivencia.capacidad_maxima > 0 && (
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
