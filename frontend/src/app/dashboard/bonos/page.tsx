'use client';

import { useState, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import * as XLSX from 'xlsx';
import {
  Upload,
  Gift,
  Printer,
  Trash2,
  FileSpreadsheet,
  Info,
  X,
  Settings2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BeneficiarioRow {
  id: string;
  codigo: string;
  beneficiario: string;
  padre: string;
  cedula: string;
  monto: string;
}

function calcularFechaExpiracion(): string {
  const now = new Date();
  // +1 month and +15 days
  const exp = new Date(now);
  exp.setMonth(exp.getMonth() + 1);
  exp.setDate(exp.getDate() + 15);
  const d = exp.getDate().toString().padStart(2, '0');
  const m = (exp.getMonth() + 1).toString().padStart(2, '0');
  const y = exp.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatMonto(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return `RD$${num.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface BondCardProps {
  row: BeneficiarioRow;
  mes: string;
  expira: string;
}

function BondCard({ row, mes, expira }: BondCardProps) {
  // Y positions: determined from screenshot analysis showing each value was 1 row above its label.
  // All Y values shifted down ~9.7% from previous version.
  // X positions: calibrated from pixel-scan of template (2000x971).
  return (
    <div
      className="bond-card"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '2000/971',
        backgroundImage: 'url(/bond_template.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}
    >
      {/* Mes — after 'Mes:' label (ends ~44%), Y=37.3% */}
      <div style={{ position: 'absolute', top: '37.3%', left: '44.5%',
        fontSize: 'clamp(7px, 1.4vw, 15px)', fontWeight: '400', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
        {mes}
      </div>

      {/* Padre — after 'Autorizado A:' (ends ~31.5%), Y=46.3% */}
      <div style={{ position: 'absolute', top: '46.3%', left: '32%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: '#1a1a1a',
        maxWidth: '28%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {row.padre}
      </div>

      {/* Cédula — Y=46.3% */}
      <div style={{ position: 'absolute', top: '46.3%', left: '76%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: '#1a1a1a',
        maxWidth: '18%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {row.cedula}
      </div>

      {/* Beneficiario — Y=55.2% */}
      <div style={{ position: 'absolute', top: '55.2%', left: '37%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: '#1a1a1a',
        maxWidth: '26%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {row.beneficiario}
      </div>

      {/* Código — Y=55.2% */}
      <div style={{ position: 'absolute', top: '55.2%', left: '76%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
        {row.codigo}
      </div>

      {/* Monto — Y=62% */}
      <div style={{ position: 'absolute', top: '64.5%', left: '25%',
        fontSize: 'clamp(7px, 1.4vw, 15px)', fontWeight: '400', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
        {formatMonto(row.monto)}
      </div>

      {/* Expira — Y=70% */}
      <div style={{ position: 'absolute', top: '80%', left: '66%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: 'red', whiteSpace: 'nowrap' }}>
        {expira}
      </div>
    </div>
  );
}

export default function BonosPage() {
  const [rows, setRows] = useState<BeneficiarioRow[]>([]);
  const [mes, setMes] = useState('');
  const [expira] = useState(calcularFechaExpiracion());
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExcel = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        // Find header row
        let headerRow = -1;
        let colMap: Record<string, number> = {};

        for (let i = 0; i < Math.min(raw.length, 10); i++) {
          const row = raw[i].map((c: any) => String(c).toLowerCase());
          const hasId = row.some(c => c.includes('id local') || c.includes('beneficiario'));
          if (hasId) {
            headerRow = i;
            row.forEach((cell, idx) => {
              // IMPORTANT: use very specific checks to avoid 'cedula del padre' matching 'padre'
              if (cell.includes('id local')) {
                colMap['codigo'] = idx;
              } else if (cell.includes('nombre del beneficiario') || cell.includes('nombre beneficiario')) {
                colMap['beneficiario'] = idx;
              } else if (cell.includes('nombre del padre') || cell.includes('nombre padre')) {
                // Only match 'nombre del padre', NOT 'cedula del padre'
                colMap['padre'] = idx;
              } else if (cell.includes('cedula') || cell.includes('cédula')) {
                colMap['cedula'] = idx;
              } else if (cell.includes('monto')) {
                colMap['monto'] = idx;
              }
            });
            break;
          }
        }

        // Fallback column detection by index based on known Excel structure
        if (headerRow === -1) {
          // Try row 1 (index 1) as header
          headerRow = 1;
          colMap = { codigo: 0, beneficiario: 1, padre: 2, cedula: 3, monto: 4 };
        }

        const parsed: BeneficiarioRow[] = [];
        for (let i = headerRow + 1; i < raw.length; i++) {
          const row = raw[i];
          const codigo = String(row[colMap['codigo']] ?? '').trim();
          const beneficiario = String(row[colMap['beneficiario']] ?? '').trim();
          const padre = String(row[colMap['padre']] ?? '').trim();
          const cedula = String(row[colMap['cedula']] ?? '').trim();
          const montoRaw = row[colMap['monto']];
          const monto = montoRaw !== '' && montoRaw != null ? String(montoRaw).trim() : '';

          if (codigo || beneficiario) {
            parsed.push({
              id: `row-${i}-${Date.now()}`,
              codigo,
              beneficiario,
              padre,
              cedula,
              monto,
            });
          }
        }

        setRows(parsed);
        setFileName(file.name);
        setError('');
      } catch (err) {
        setError('Error al procesar el archivo Excel. Verifica que sea un archivo .xlsx o .xls válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }
    parseExcel(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleCellEdit = (id: string, field: keyof BeneficiarioRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handlePrint = () => {
    if (rows.length === 0) {
      setError('No hay bonos para imprimir. Carga un archivo Excel primero.');
      return;
    }
    window.print();
  };

  const mesesCount = rows.length;
  const BONOS_PER_PAGE = 2;
  const pagesCount = Math.ceil(mesesCount / BONOS_PER_PAGE);

  return (
    <ProtectedRoute requiredPermisos={['reportes:ver']}>
      <DashboardLayout>
        {/* Print styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #bonos-print-area,
            #bonos-print-area * {
              visibility: visible !important;
            }
            #bonos-print-area {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            @page {
              size: letter portrait;
              margin: 0.3in 0.3in 0.3in 0.3in;
            }
          }
        `}</style>

        {/* Hidden Print Area */}
        <div id="bonos-print-area" style={{ display: 'none' }}>
          <style>{`
            @media print {
              #bonos-print-area {
                display: block !important;
              }
              .print-page {
                page-break-inside: avoid;
                page-break-after: always;
                width: 7.9in;
                height: 10.4in;
                display: flex;
                flex-direction: column;
                gap: 0.2in;
                justify-content: flex-start;
                align-items: stretch;
                margin: 0 auto; /* Center on page */
              }
              .print-page:last-child {
                page-break-after: auto;
              }
              .print-bond {
                width: 100%;
                flex: 0 0 auto;
                position: relative;
                overflow: hidden;
              }
              .print-bond img {
                width: 100%;
                display: block;
              }
              .print-field {
                position: absolute;
                font-family: Arial, Helvetica, sans-serif;
                color: #1a1a1a;
                font-weight: 400; /* Regular instead of bold */
                line-height: 1;
              }
            }
          `}</style>
          {Array.from({ length: pagesCount }).map((_, pageIdx) => {
            const pageRows = rows.slice(pageIdx * BONOS_PER_PAGE, pageIdx * BONOS_PER_PAGE + BONOS_PER_PAGE);
            return (
              <div key={pageIdx} className="print-page">
                {pageRows.map((row) => (
                  <div key={row.id} className="print-bond">
                    <img src="/bond_template.png" alt="bono" />
                    {/* Y positions: all shifted down 9.7% from prior version to match actual template label rows */}
                    <span className="print-field" style={{ top: '35%', left: '44.5%', fontSize: '13pt' }}>{mes}</span>
                    <span className="print-field" style={{ top: '46.3%', left: '32%',   fontSize: '11pt', maxWidth: '27%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'inline-block' }}>{row.padre}</span>
                    <span className="print-field" style={{ top: '46.3%', left: '76%',   fontSize: '11pt', maxWidth: '18%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'inline-block' }}>{row.cedula}</span>
                    <span className="print-field" style={{ top: '55.2%', left: '37%',   fontSize: '11pt', maxWidth: '26%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'inline-block' }}>{row.beneficiario}</span>
                    <span className="print-field" style={{ top: '55.2%', left: '76%',   fontSize: '11pt' }}>{row.codigo}</span>
                    <span className="print-field" style={{ top: '64.5%',   left: '25%',   fontSize: '13pt', color: '#1a1a1a' }}>{formatMonto(row.monto)}</span>
                    <span className="print-field" style={{ top: '80%',   left: '66%',   fontSize: '11pt', color: 'red' }}>{expira}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Screen UI */}
        <div className="space-y-6 print:hidden">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="w-7 h-7 text-red-500" />
              Generación de Bonos de Regalo
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Carga un archivo Excel con los beneficiarios y genera los bonos listos para imprimir.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel: Upload + Config */}
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Mes del Bono
                  </label>
                  <input
                    type="text"
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    placeholder="Ej: Junio 2026"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fecha de Expiración
                  </label>
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
                          Si los textos no quedan alineados al imprimir, ajusta las posiciones en la vista previa a continuación y luego usa el botón "Imprimir".
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  disabled={rows.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Bonos ({rows.length})
                </button>

                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Al imprimir, activa <strong>"Gráficos de fondo"</strong> en la ventana de impresión del navegador para que aparezca la imagen del bono.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel: Table + Preview */}
            <div className="lg:col-span-2 space-y-4">
              {/* Table */}
              {rows.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Listado de Beneficiarios
                    </h2>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      {showPreview ? 'Ocultar vista previa' : 'Ver previsualización'}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {['#', 'Código', 'Beneficiario', 'Padre/Tutor', 'Cédula', 'Monto', ''].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rows.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-4 py-2 text-xs text-gray-400">{idx + 1}</td>
                            {(['codigo', 'beneficiario', 'padre', 'cedula', 'monto'] as const).map((field) => (
                              <td key={field} className="px-4 py-2">
                                {editingId === row.id ? (
                                  <input
                                    type="text"
                                    value={row[field]}
                                    onChange={(e) => handleCellEdit(row.id, field, e.target.value)}
                                    className="w-full text-xs border border-blue-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50"
                                  />
                                ) : (
                                  <span
                                    className="text-xs text-gray-700 cursor-pointer hover:text-blue-600"
                                    onClick={() => setEditingId(row.id)}
                                    title="Clic para editar"
                                  >
                                    {field === 'monto' ? formatMonto(row[field]) : row[field] || <span className="text-gray-300">—</span>}
                                  </span>
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {editingId === row.id ? (
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded hover:bg-green-50"
                                  >
                                    ✓
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setEditingId(row.id)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
                                  >
                                    ✎
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(row.id)}
                                  className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Preview grid */}
              {showPreview && rows.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-red-500" />
                    Vista Previa de Bonos
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {rows.map((row) => (
                      <div key={row.id} className="rounded-lg overflow-hidden shadow border border-gray-100">
                        <BondCard row={row} mes={mes} expira={expira} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {rows.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700">No hay bonos cargados</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Carga un archivo Excel con el listado de beneficiarios para comenzar.
                  </p>
                  <div className="mt-4 bg-gray-50 rounded-lg p-4 text-left max-w-sm mx-auto">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Columnas esperadas en el Excel:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• <strong>ID Local del Beneficiario</strong> (Código)</li>
                      <li>• <strong>Nombre del Beneficiario</strong></li>
                      <li>• <strong>Nombre del padre</strong></li>
                      <li>• <strong>Cedula del padre</strong></li>
                      <li>• <strong>Monto del Regalo</strong></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
