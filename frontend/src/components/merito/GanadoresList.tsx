'use client';

import { Users, Trophy, Loader2, Download, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { GanadoresResponse, ModoGanadores } from '@/lib/types';

interface GanadoresListProps {
  preview: GanadoresResponse | null;
  modo: ModoGanadores;
  cantPrimaria: number;
  cantSecundaria: number;
  minPrimaria: number;
  maxPrimaria: number;
  minSecundaria: number;
  maxSecundaria: number;
  onModoChange: (m: ModoGanadores) => void;
  onCantPrimariaChange: (n: number) => void;
  onCantSecundariaChange: (n: number) => void;
  onMinPrimariaChange: (n: number) => void;
  onMaxPrimariaChange: (n: number) => void;
  onMinSecundariaChange: (n: number) => void;
  onMaxSecundariaChange: (n: number) => void;
  onPreview: () => void;
  onDownloadPDF: () => void;
  onBack: () => void;
  onClose: () => void;
  loading: boolean;
  showPreview: boolean;
}

function Stepper({ value, onChange, min = 1 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600"
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={100}
        className="text-2xl font-black text-gray-800 w-16 text-center bg-transparent outline-none border-b-2 border-transparent focus:border-blue-500"
      />
      <button
        onClick={() => onChange(Math.min(100, value + 1))}
        className="w-9 h-9 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600"
      >
        +
      </button>
    </div>
  );
}

function RangeInput({
  label,
  value,
  onChange,
  colorClass,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  colorClass: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-xs font-bold text-white mb-2 px-2 py-0.5 rounded-full ${colorClass}`}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={0}
        max={100}
        onChange={(e) => onChange(Number(e.target.value))}
        className="text-xl font-black text-gray-800 w-16 text-center bg-white border border-gray-200 rounded-lg py-1 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export function GanadoresList({
  preview,
  modo,
  cantPrimaria,
  cantSecundaria,
  minPrimaria,
  maxPrimaria,
  minSecundaria,
  maxSecundaria,
  onModoChange,
  onCantPrimariaChange,
  onCantSecundariaChange,
  onMinPrimariaChange,
  onMaxPrimariaChange,
  onMinSecundariaChange,
  onMaxSecundariaChange,
  onPreview,
  onDownloadPDF,
  onBack,
  onClose,
  loading,
  showPreview,
}: GanadoresListProps) {
  if (!showPreview || !preview) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-gray-600">
            Configura cómo quieres seleccionar los ganadores por cada ciclo.
          </p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full sm:w-auto mx-auto">
          <button
            onClick={() => onModoChange('cantidad')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              modo === 'cantidad'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Por Cantidad
          </button>
          <button
            onClick={() => onModoChange('rango_nota')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              modo === 'rango_nota'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Por Nota (Rango)
          </button>
        </div>

        {modo === 'cantidad' ? (
          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-700 mb-3 bg-blue-100 px-3 py-1 rounded-full text-blue-800">
                Primaria
              </span>
              <Stepper value={cantPrimaria} onChange={onCantPrimariaChange} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-700 mb-3 bg-green-100 px-3 py-1 rounded-full text-green-800">
                Secundaria
              </span>
              <Stepper value={cantSecundaria} onChange={onCantSecundariaChange} />
            </div>
          </div>
        ) : (
          <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700 bg-blue-100 px-3 py-1 rounded-full text-blue-800">
                Primaria
              </span>
              <p className="text-xs text-gray-500">
                Todos los promedios dentro del rango son ganadores, sin importar cuántos sean.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6">
              <RangeInput label="Mínimo" value={minPrimaria} onChange={onMinPrimariaChange} colorClass="bg-blue-500" />
              <span className="text-2xl font-bold text-gray-400">—</span>
              <RangeInput label="Máximo" value={maxPrimaria} onChange={onMaxPrimariaChange} colorClass="bg-blue-600" />
            </div>
            <hr className="border-gray-200" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700 bg-green-100 px-3 py-1 rounded-full text-green-800">
                Secundaria
              </span>
              <p className="text-xs text-gray-500">
                Todos los promedios dentro del rango son ganadores, sin importar cuántos sean.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6">
              <RangeInput label="Mínimo" value={minSecundaria} onChange={onMinSecundariaChange} colorClass="bg-green-500" />
              <span className="text-2xl font-bold text-gray-400">—</span>
              <RangeInput label="Máximo" value={maxSecundaria} onChange={onMaxSecundariaChange} colorClass="bg-green-600" />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onPreview}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            Ver Ganadores
          </Button>
        </div>
      </div>
    );
  }

  const tituloPrimaria =
    modo === 'rango_nota'
      ? `Primaria (Promedio ${minPrimaria}–${maxPrimaria})`
      : `Primaria (Top ${cantPrimaria})`;
  const tituloSecundaria =
    modo === 'rango_nota'
      ? `Secundaria (Promedio ${minSecundaria}–${maxSecundaria})`
      : `Secundaria (Top ${cantSecundaria})`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <span className="font-bold text-blue-900">Vista Previa de Ganadores</span>
        </div>
        <Button
          onClick={onDownloadPDF}
          className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar PDF
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-3">{tituloPrimaria}</h3>
          <div className="space-y-2">
            {preview.primaria.map((g, i) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-gray-400 w-4">{i + 1}.</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{g.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {g.codigo} • Curso: {g.curso}º
                    </p>
                  </div>
                </div>
                <span className="font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                  {Number(g.promedio).toFixed(2)}
                </span>
              </div>
            ))}
            {preview.primaria.length === 0 && (
              <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">
                No hay ganadores en este rango
              </p>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">{tituloSecundaria}</h3>
          <div className="space-y-2">
            {preview.secundaria.map((g, i) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-gray-400 w-4">{i + 1}.</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{g.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {g.codigo} • Curso: {g.curso}º
                    </p>
                  </div>
                </div>
                <span className="font-black text-green-600 bg-green-100 px-2 py-1 rounded-md">
                  {Number(g.promedio).toFixed(2)}
                </span>
              </div>
            ))}
            {preview.secundaria.length === 0 && (
              <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">
                No hay ganadores en este rango
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-start pt-4 border-t">
        <Button variant="ghost" onClick={onBack} className="text-gray-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a configurar
        </Button>
      </div>
    </div>
  );
}
