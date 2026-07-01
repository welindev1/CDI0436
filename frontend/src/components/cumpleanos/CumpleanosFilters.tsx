'use client';

import { Calendar } from 'lucide-react';

interface Mes {
  value: number;
  label: string;
}

interface CumpleanosFiltersProps {
  mesSeleccionado: number;
  mesActual: number;
  meses: Mes[];
  onMesChange: (mes: number) => void;
}

export default function CumpleanosFilters({
  mesSeleccionado,
  mesActual,
  meses,
  onMesChange,
}: CumpleanosFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <label className="font-medium text-gray-900">Selecciona un mes:</label>
        </div>
        <div className="flex flex-wrap gap-2">
          {meses.map((mes) => (
            <button
              key={mes.value}
              onClick={() => onMesChange(mes.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mesSeleccionado === mes.value
                  ? 'bg-pink-500 text-white'
                  : mes.value === mesActual
                  ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mes.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
