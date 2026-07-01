'use client';

import { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { ImportarResultado } from '@/lib/types';

interface ImportarExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function ImportarExcelModal({ isOpen, onClose, onImportComplete }: ImportarExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<ImportarResultado | null>(null);
  const [actualizarExistentes, setActualizarExistentes] = useState(false);
  const [omitirErrores, setOmitirErrores] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar que sea un archivo Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError('');
      setResultado(null);
    }
  };

  const handleDescargarPlantilla = async () => {
    try {
      setIsLoading(true);
      const blob = await beneficiariosApi.descargarPlantilla();
      
      // Crear URL y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_beneficiarios.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError('Error al descargar la plantilla');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportar = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setResultado(null);

      const result = await beneficiariosApi.importarDesdeExcel(
        file,
        actualizarExistentes,
        omitirErrores
      );

      setResultado(result);

      if (result.exitosos > 0) {
        setTimeout(() => {
          onImportComplete();
          if (result.fallidos === 0) {
            onClose();
          }
        }, 2000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al importar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError('');
    setResultado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDescargarReporteErrores = () => {
    if (!resultado?.errores || resultado.errores.length === 0) return;

    const datosErrores = resultado.errores.map((err) => ({
      FILA: err.fila,
      ERROR: err.error,
      CODIGO: err.datos?.CODIGO || '',
      NOMBRE: err.datos?.NOMBRE || '',
      APELLIDO: err.datos?.APELLIDO || '',
      DIRECCION: err.datos?.DIRECCION || '',
      TELEFONO: err.datos?.TELEFONO || '',
      'PADRE O TUTOR': err.datos?.['PADRE O TUTOR'] || err.datos?.PADRE_TUTOR || '',
      'FECHA DE NACIMIENTO': err.datos?.['FECHA DE NACIMIENTO'] || err.datos?.FECHA_NACIMIENTO || '',
      CORREO: err.datos?.CORREO || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosErrores);
    worksheet['!cols'] = [
      { wch: 6 }, { wch: 40 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
      { wch: 20 }, { wch: 25 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errores');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'errores_importacion.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Beneficiarios desde Excel"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">Instrucciones</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Descarga la plantilla para ver el formato correcto</li>
                <li>• Los campos requeridos son: CODIGO y NOMBRE</li>
                <li>• El código debe ser único para cada beneficiario</li>
                <li>• Usa formato YYYY-MM-DD para FECHA DE NACIMIENTO (ej: 2009-03-15)</li>
                <li>• Los demás campos son opcionales</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón de descargar plantilla */}
        <div>
          <Button
            variant="outline"
            onClick={handleDescargarPlantilla}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Plantilla de Excel
          </Button>
        </div>

        {/* Opciones */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={actualizarExistentes}
              onChange={(e) => setActualizarExistentes(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Actualizar beneficiarios existentes (si el código ya existe)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={omitirErrores}
              onChange={(e) => setOmitirErrores(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Continuar importando aunque haya errores en algunas filas
            </span>
          </label>
        </div>

        {/* Selector de archivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar archivo Excel
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="excel-file-input"
          />
          <label
            htmlFor="excel-file-input"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                {file ? file.name : 'Click para seleccionar un archivo'}
              </p>
              <p className="text-xs text-gray-500">
                {file ? `${(file.size / 1024).toFixed(2)} KB` : 'XLSX o XLS'}
              </p>
            </div>
          </label>
        </div>

        {/* Errores */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Resultado */}
        {resultado && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Exitosos</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{resultado.exitosos}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">Fallidos</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{resultado.fallidos}</p>
              </div>
            </div>

            {resultado.errores && resultado.errores.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Errores encontrados:</span>
                </div>
                <div className="space-y-2">
                  {resultado.errores.map((error, index: number) => (
                    <div key={index} className="text-sm text-yellow-800">
                      <span className="font-medium">Fila {error.fila}:</span> {error.error}
                      {error.datos?.CODIGO && (
                        <span className="text-yellow-600"> (Código: {error.datos.CODIGO})</span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleDescargarReporteErrores}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-medium rounded-lg transition-colors border border-yellow-300"
                >
                  <FileDown className="w-4 h-4" />
                  Descargar Reporte de Errores
                </button>
              </div>
            )}

            {resultado.exitosos > 0 && (
              <Alert variant="success">
                ¡Se importaron {resultado.exitosos} beneficiario(s) correctamente!
              </Alert>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {resultado ? (
            <>
              <Button variant="outline" onClick={handleReset}>
                Importar Otro Archivo
              </Button>
              <Button onClick={onClose}>
                Cerrar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                onClick={handleImportar}
                disabled={!file || isLoading}
                isLoading={isLoading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}