'use client';

import { ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export interface DiaInfo {
  fecha: string;
  diaNombre: string;
  diaNum: number;
}

interface MenuCalendarProps {
  mesLabel: string;
  diasDelMes: DiaInfo[];
  diaSeleccionado: string | null;
  tieneMenuEseDia: (fecha: string, tanda: 'matutina' | 'vespertina') => boolean;
  onSelectDia: (fecha: string | null) => void;
  onCambiarMes: (delta: number) => void;
}

export default function MenuCalendar({
  mesLabel,
  diasDelMes,
  diaSeleccionado,
  tieneMenuEseDia,
  onSelectDia,
  onCambiarMes,
}: MenuCalendarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => onCambiarMes(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">{mesLabel}</h2>
        <button
          onClick={() => onCambiarMes(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {diasDelMes.length === 0 ? (
        <p className="text-center text-gray-400 py-4">No hay días disponibles este mes</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {diasDelMes.map(({ fecha, diaNombre, diaNum }) => {
            const seleccionado = diaSeleccionado === fecha;
            const tieneM = tieneMenuEseDia(fecha, 'matutina');
            const tieneV = tieneMenuEseDia(fecha, 'vespertina');
            return (
              <button
                key={fecha}
                onClick={() => onSelectDia(seleccionado ? null : fecha)}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all font-medium
                  ${seleccionado
                    ? 'bg-green-600 border-green-600 text-white shadow-lg scale-105'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
                  }`}
              >
                <span className={`text-xs mb-1 ${seleccionado ? 'text-green-100' : 'text-gray-400'}`}>
                  {diaNombre}
                </span>
                <span className="text-2xl font-bold">{diaNum}</span>
                <div className="flex gap-1 mt-2">
                  <span
                    className={`w-2 h-2 rounded-full ${tieneM ? 'bg-yellow-400' : seleccionado ? 'bg-green-400' : 'bg-gray-200'}`}
                    title="Matutina"
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${tieneV ? 'bg-indigo-400' : seleccionado ? 'bg-green-400' : 'bg-gray-200'}`}
                    title="Vespertina"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />Menú matutino
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />Menú vespertino
        </span>
      </div>
    </div>
  );
}
