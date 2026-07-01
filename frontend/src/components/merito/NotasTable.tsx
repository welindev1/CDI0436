'use client';

import { Edit } from 'lucide-react';
import type { NotaMerito } from '@/lib/types';

interface NotasTableProps {
  notas: NotaMerito[];
  searchTerm?: string;
  onEdit?: (nota: NotaMerito) => void;
}

export function NotasTable({ notas, onEdit }: NotasTableProps) {
  if (notas.length === 0) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Estudiante', 'Ciclo', 'Curso', 'Matemáticas', 'Lengua Esp.', 'Naturales', 'Sociales', 'Promedio', 'Acciones'].map(
                (h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      h === 'Promedio' ? 'text-center font-bold text-blue-600' : ''
                    }`}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                No hay notas registradas todavía.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estudiante
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ciclo
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Curso
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Matemáticas
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lengua Esp.
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Naturales
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sociales
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">
              Promedio
            </th>
            {onEdit && (
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notas.map((nota) => (
            <tr key={nota.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">
                  {nota.nombre} {nota.apellido}
                </div>
                <div className="text-xs text-gray-500">{nota.codigo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    nota.ciclo === 'Primaria'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {nota.ciclo}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">
                {nota.curso}º
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                {Number(nota.matematicas).toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                {Number(nota.lengua_espanola).toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                {Number(nota.naturales).toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                {Number(nota.sociales).toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600 bg-blue-50/30">
                <span className="font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                  {Number(nota.promedio).toFixed(2)}
                </span>
              </td>
              {onEdit && (
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => onEdit(nota)}
                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors inline-flex items-center justify-center"
                    title="Editar nota"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
