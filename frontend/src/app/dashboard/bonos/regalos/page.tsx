'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BonoFilters from '@/components/bonos/BonoFilters';
import BonoList from '@/components/bonos/BonoList';
import { calcularFechaExpiracion, imprimirBonos } from '@/lib/utils/exportBonoPDF';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { useCrearBonosLote } from '@/lib/hooks';
import type { BeneficiarioRow } from '@/lib/types';
import { Gift, X, Save, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function BonosRegalosPage() {
  const [rows, setRows] = useState<BeneficiarioRow[]>([]);
  const [mes, setMes] = useState('');
  const [expira] = useState(calcularFechaExpiracion());
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const crearLoteMutation = useCrearBonosLote();
  const pagesCount = Math.ceil(rows.length / 2);

  const parseExcel = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        let headerRow = -1;
        let colMap: Record<string, number> = {};

        for (let i = 0; i < Math.min(raw.length, 10); i++) {
          const row = raw[i].map((c: unknown) => String(c).toLowerCase());
          const hasId = row.some(c => c.includes('id local') || c.includes('beneficiario'));
          if (hasId) {
            headerRow = i;
            row.forEach((cell, idx) => {
              if (cell.includes('id local')) {
                colMap['codigo'] = idx;
              } else if (cell.includes('nombre del beneficiario') || cell.includes('nombre beneficiario')) {
                colMap['beneficiario'] = idx;
              } else if (cell.includes('nombre del padre') || cell.includes('nombre padre')) {
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

        if (headerRow === -1) {
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

        try {
          const dbBeneficiarios = await beneficiariosApi.getAll();
          const benefMap = new Map(dbBeneficiarios.map(b => [b.codigo, b]));
          parsed.forEach(row => {
            if (row.codigo) {
              const dbBen = benefMap.get(row.codigo);
              if (dbBen) {
                const fullName = [dbBen.nombre, dbBen.apellido].filter(Boolean).join(' ').trim();
                if (fullName) row.beneficiario = fullName;
              }
            }
          });
        } catch (apiErr) {
          console.warn('Error al obtener beneficiarios para validar nombres:', apiErr);
        }

        setRows(parsed);
        setError('');
        setGuardadoExitoso(false);
      } catch {
        setError('Error al procesar el archivo Excel. Verifica que sea un archivo .xlsx o .xls válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }
    parseExcel(file);
  }, [parseExcel]);

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
    imprimirBonos(rows, mes, expira);
  };

  const handleGuardarEnBD = async () => {
    if (rows.length === 0) {
      setError('No hay bonos para guardar. Carga un archivo Excel primero.');
      return;
    }
    if (!mes.trim()) {
      setError('Debes ingresar el "Mes del Bono" antes de guardar.');
      return;
    }

    try {
      const bonosParaGuardar = rows.map((row) => ({
        codigo: row.codigo,
        beneficiario_nombre: row.beneficiario,
        padre_nombre: row.padre || undefined,
        cedula: row.cedula || undefined,
        monto: parseFloat(row.monto) || 0,
        mes: mes,
        expira: expira,
      }));

      await crearLoteMutation.mutateAsync(bonosParaGuardar);
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3000);
    } catch {
      setError('Error al guardar los bonos en la base de datos.');
    }
  };

  return (
    <ProtectedRoute requiredPermisos={['bonos:ver']}>
      <DashboardLayout>
        <div className="space-y-6 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="w-7 h-7 text-red-500" />
              Bonos de Regalos
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Carga un Excel, genera los bonos y guárdalos en la base de datos para dar seguimiento.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {guardadoExitoso && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700 text-sm">Bonos guardados exitosamente en la base de datos.</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <BonoFilters
                rows={rows}
                mes={mes}
                expira={expira}
                pagesCount={pagesCount}
                onFileChange={handleFile}
                onMesChange={setMes}
                onPrint={handlePrint}
              />

              {rows.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <button
                    onClick={handleGuardarEnBD}
                    disabled={crearLoteMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    <Save className="w-5 h-5" />
                    {crearLoteMutation.isPending ? 'Guardando...' : 'Guardar bonos en BD'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Esto guardará {rows.length} bonos para darles seguimiento de entrega.
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <BonoList
                rows={rows}
                mes={mes}
                expira={expira}
                showPreview={showPreview}
                onTogglePreview={() => setShowPreview(p => !p)}
                onDelete={handleDelete}
                onCellEdit={handleCellEdit}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
