'use client';

import { useState, useRef } from 'react';
import {
  Upload, FileSpreadsheet, Settings2, Info, Printer, ChevronDown, ChevronUp,
} from 'lucide-react';

interface BonoFiltersProps {
  rows: unknown[];
  mes: string;
  expira: string;
  pagesCount: number;
  onFileChange: (file: File) => void;
  onMesChange: (mes: string) => void;
  onPrint: () => void;
}

export default function BonoFilters({
  rows,
  mes,
  expira,
  pagesCount,
  onFileChange,
  onMesChange,
  onPrint,
}: BonoFiltersProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showAdjustments, setShowAdjustments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          Cargar Excel
        </h2>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : fileName
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />
          {fileName ? (
            <>
              <FileSpreadsheet className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-700">{fileName}</p>
              <p className="text-xs text-green-600 mt-1">{rows.length} registros cargados</p>
              <p className="text-xs text-gray-500 mt-2">Clic para cambiar archivo</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Arrastra el Excel aquí</p>
              <p className="text-xs text-gray-500 mt-1">o haz clic para seleccionar</p>
              <p className="text-xs text-gray-400 mt-1">.xlsx o .xls</p>
            </>
          )}
        </div>
      </div>

      {/* Config Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-blue-600" />
          Configuración del Bono
        </h2>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mes del Bono</label>
          <input
            type="text"
            value={mes}
            onChange={(e) => onMesChange(e.target.value)}
            placeholder="Ej: Junio 2026"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de Expiración</label>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-sm font-medium text-gray-700">{expira}</span>
            <span className="text-xs text-gray-400">(+1 mes 15 días)</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-4 text-white">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wide">Resumen</p>
          <p className="text-2xl font-bold mt-1">{rows.length}</p>
          <p className="text-xs opacity-80">bonos · {pagesCount} {pagesCount === 1 ? 'página' : 'páginas'}</p>
        </div>

        {/* Adjustments Toggle */}
        <div>
          <button
            onClick={() => setShowAdjustments(!showAdjustments)}
            className="w-full flex items-center justify-between text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="flex items-center gap-1">
              <Settings2 className="w-3 h-3" />
              Ajustes avanzados
            </span>
            {showAdjustments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showAdjustments && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Si los textos no quedan alineados al imprimir, ajusta las posiciones en la vista previa a continuación y luego usa el botón &quot;Imprimir&quot;.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Print Button */}
        <button
          onClick={onPrint}
          disabled={rows.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Printer className="w-4 h-4" />
          Imprimir Bonos ({rows.length})
        </button>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Al imprimir, activa <strong>&quot;Gráficos de fondo&quot;</strong> en la ventana de impresión del navegador para que aparezca la imagen del bono.
          </p>
        </div>
      </div>
    </div>
  );
}
