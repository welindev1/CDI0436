'use client';

import type { TableRow } from '@/lib/types';

interface ReporteEstadisticoTableProps {
  headers: string[];
  rows: TableRow[];
  emptyMessage?: string;
}

export default function ReporteEstadisticoTable({
  headers,
  rows,
  emptyMessage = 'No hay datos para mostrar con estos filtros.',
}: ReporteEstadisticoTableProps) {
  return (
    <div className="p-6 overflow-x-auto">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        Detalles ({rows.length} registros)
      </h3>
      {rows.length > 0 ? (
        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0 z-10 shadow-sm">
              <tr>
                {headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={row.key || i} className="hover:bg-gray-50">
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
