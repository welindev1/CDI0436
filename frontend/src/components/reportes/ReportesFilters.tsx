'use client';

import { Calendar, ListFilter } from 'lucide-react';
import type { TipoPeriodo, TipoReporteGlobal } from '@/lib/types';
import { meses, anios } from '@/lib/utils/formatters';

interface ReportesFiltersProps {
  tipoPeriodo: TipoPeriodo;
  tipoReporteGlobal: TipoReporteGlobal;
  fechaDia: string;
  mesSeleccionado: string;
  anioSeleccionado: string;
  fechaInicio: string;
  fechaFin: string;
  isLoading: boolean;
  isGlobal: boolean;
  onChangeTipoPeriodo: (tipo: TipoPeriodo) => void;
  onChangeTipoReporteGlobal: (tipo: TipoReporteGlobal) => void;
  onChangeFechaDia: (val: string) => void;
  onChangeMes: (val: string) => void;
  onChangeAnio: (val: string) => void;
  onChangeFechaInicio: (val: string) => void;
  onChangeFechaFin: (val: string) => void;
  onGenerate: () => void;
}

const tiposPeriodo: { value: TipoPeriodo; label: string }[] = [
  { value: 'dia', label: 'Un día' },
  { value: 'mes', label: 'Un mes' },
  { value: 'anio', label: 'Un año' },
  { value: 'rango', label: 'Fechas personalizadas' },
  { value: 'todo', label: 'Desde el inicio' },
];

export default function ReportesFilters({
  tipoPeriodo,
  tipoReporteGlobal,
  fechaDia,
  mesSeleccionado,
  anioSeleccionado,
  fechaInicio,
  fechaFin,
  isLoading,
  isGlobal,
  onChangeTipoPeriodo,
  onChangeTipoReporteGlobal,
  onChangeFechaDia,
  onChangeMes,
  onChangeAnio,
  onChangeFechaInicio,
  onChangeFechaFin,
  onGenerate,
}: ReportesFiltersProps) {
  if (!isGlobal) return null;

  return (
    <div className="space-y-6">
      {/* Detail level selector for global report */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-blue-500" /> Nivel de Detalle
        </h2>
        <div className="flex gap-4">
          <label
            className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
              tipoReporteGlobal === 'estadistico'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              className="w-4 h-4 text-blue-600"
              checked={tipoReporteGlobal === 'estadistico'}
              onChange={() => onChangeTipoReporteGlobal('estadistico')}
            />
            <div>
              <p className="font-bold text-sm text-gray-900">Estadístico</p>
              <p className="text-xs text-gray-500">Resumen y porcentajes</p>
            </div>
          </label>
          <label
            className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
              tipoReporteGlobal === 'detallado'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              className="w-4 h-4 text-blue-600"
              checked={tipoReporteGlobal === 'detallado'}
              onChange={() => onChangeTipoReporteGlobal('detallado')}
            />
            <div>
              <p className="font-bold text-sm text-gray-900">Detallado</p>
              <p className="text-xs text-gray-500">Incluir lista de nombres</p>
            </div>
          </label>
        </div>
      </div>

      {/* Period filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" /> Rango de Tiempo
        </h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {tiposPeriodo.map((tipo) => (
            <button
              key={tipo.value}
              onClick={() => onChangeTipoPeriodo(tipo.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                tipoPeriodo === tipo.value
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>

        {/* Date inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tipoPeriodo === 'dia' && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Día exacto</label>
              <input
                type="date"
                value={fechaDia}
                onChange={(e) => onChangeFechaDia(e.target.value)}
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {tipoPeriodo === 'mes' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mes</label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) => onChangeMes(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  {meses.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Año</label>
                <select
                  value={anioSeleccionado}
                  onChange={(e) => onChangeAnio(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {anios.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {tipoPeriodo === 'anio' && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Año completo</label>
              <select
                value={anioSeleccionado}
                onChange={(e) => onChangeAnio(e.target.value)}
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {anios.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tipoPeriodo === 'rango' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Desde</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => onChangeFechaInicio(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hasta</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => onChangeFechaFin(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {tipoPeriodo === 'todo' && (
            <div className="col-span-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
              Se exportará absolutamente todo el registro histórico del sistema. Puede tardar un poco.
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Calendar className="w-5 h-5" /> Ver Reporte
          </button>
        </div>
      </div>
    </div>
  );
}
