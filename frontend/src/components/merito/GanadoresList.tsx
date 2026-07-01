'use client';

import { Users, Trophy, Loader2, Download, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { GanadoresResponse } from '@/lib/types';

interface GanadoresListProps {
  preview: GanadoresResponse | null;
  cantPrimaria: number;
  cantSecundaria: number;
  onCantPrimariaChange: (n: number) => void;
  onCantSecundariaChange: (n: number) => void;
  onPreview: () => void;
  onDownloadPDF: () => void;
  onBack: () => void;
  onClose: () => void;
  loading: boolean;
  showPreview: boolean;
}

export function GanadoresList({
  preview,
  cantPrimaria,
  cantSecundaria,
  onCantPrimariaChange,
  onCantSecundariaChange,
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
            Configura cuántos ganadores quieres sacar por cada ciclo.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-gray-700 mb-3 bg-blue-100 px-3 py-1 rounded-full text-blue-800">
              Primaria
            </span>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onCantPrimariaChange(Math.max(1, cantPrimaria - 1))}
                className="w-10 h-10 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600"
              >
                -
              </button>
              <span className="text-3xl font-black text-gray-800 w-12 text-center">
                {cantPrimaria}
              </span>
              <button
                onClick={() => onCantPrimariaChange(cantPrimaria + 1)}
                className="w-10 h-10 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-gray-700 mb-3 bg-green-100 px-3 py-1 rounded-full text-green-800">
              Secundaria
            </span>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onCantSecundariaChange(Math.max(1, cantSecundaria - 1))}
                className="w-10 h-10 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600"
              >
                -
              </button>
              <span className="text-3xl font-black text-gray-800 w-12 text-center">
                {cantSecundaria}
              </span>
              <button
                onClick={() => onCantSecundariaChange(cantSecundaria + 1)}
                className="w-10 h-10 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600"
              >
                +
              </button>
            </div>
          </div>
        </div>
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
          <h3 className="font-bold text-lg mb-3">Primaria (Top {cantPrimaria})</h3>
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
                No hay notas registradas
              </p>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">Secundaria (Top {cantSecundaria})</h3>
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
                No hay notas registradas
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
