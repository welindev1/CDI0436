'use client';

import { useState } from 'react';
import { Trash2, Gift } from 'lucide-react';
import BonoCard from '@/components/bonos/BonoCard';
import { formatMonto } from '@/lib/utils/exportBonoPDF';
import type { BeneficiarioRow } from '@/lib/types';

interface BonoListProps {
  rows: BeneficiarioRow[];
  mes: string;
  expira: string;
  showPreview: boolean;
  onTogglePreview: () => void;
  onDelete: (id: string) => void;
  onCellEdit: (id: string, field: keyof BeneficiarioRow, value: string) => void;
}

export default function BonoList({
  rows,
  mes,
  expira,
  showPreview,
  onTogglePreview,
  onDelete,
  onCellEdit,
}: BonoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalAmount = rows.reduce((acc, row) => acc + (parseFloat(row.monto) || 0), 0);
  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);
  const paginatedRows = rows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleEdit = (id: string, field: keyof BeneficiarioRow, value: string) => {
    onCellEdit(id, field, value);
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Listado de Beneficiarios
            </h2>
            <button
              onClick={onTogglePreview}
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
                {paginatedRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-2 text-xs text-gray-400">
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    {(['codigo', 'beneficiario', 'padre', 'cedula', 'monto'] as const).map((field) => (
                      <td key={field} className="px-4 py-2">
                        {editingId === row.id && field !== 'codigo' && field !== 'beneficiario' ? (
                          <input
                            type="text"
                            value={row[field]}
                            onChange={(e) => handleEdit(row.id, field, e.target.value)}
                            className="w-full text-xs border border-blue-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50"
                          />
                        ) : (
                          <span
                            className={`text-xs text-gray-700 ${field !== 'codigo' && field !== 'beneficiario' ? 'cursor-pointer hover:text-blue-600' : ''}`}
                            onClick={() => {
                              if (field !== 'codigo' && field !== 'beneficiario') {
                                setEditingId(row.id);
                              }
                            }}
                            title={field !== 'codigo' && field !== 'beneficiario' ? 'Clic para editar' : ''}
                          >
                            {field === 'monto'
                              ? formatMonto(row[field])
                              : row[field] || <span className="text-gray-300">&mdash;</span>}
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
                          onClick={() => onDelete(row.id)}
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

          {/* Pagination & Total */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50 gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-xs text-gray-500 font-medium px-2">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-red-100 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total de Bonos:</span>
              <span className="text-lg font-bold text-red-600">{formatMonto(totalAmount.toString())}</span>
            </div>
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
                <BonoCard row={row} mes={mes} expira={expira} />
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
  );
}
