'use client';

import { CumpleanosItem } from '@/lib/types';
import { Cake, User, Phone, Gift } from 'lucide-react';

interface CumpleanosListProps {
  cumpleanos: CumpleanosItem[];
  isLoading: boolean;
  mesSeleccionado: number;
  mesActual: number;
  diaActual: number;
  getNombreMes: (mes: number) => string;
}

function esCumpleanosHoy(mesSeleccionado: number, dia: number, mesActual: number, diaActual: number) {
  return mesSeleccionado === mesActual && dia === diaActual;
}

function esCumpleanosPasado(mesSeleccionado: number, dia: number, mesActual: number, diaActual: number) {
  if (mesSeleccionado < mesActual) return true;
  if (mesSeleccionado === mesActual && dia < diaActual) return true;
  return false;
}

export default function CumpleanosList({
  cumpleanos,
  isLoading,
  mesSeleccionado,
  mesActual,
  diaActual,
  getNombreMes,
}: CumpleanosListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando cumpleaños...</p>
        </div>
      </div>
    );
  }

  if (cumpleanos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <Cake className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No hay cumpleaños en {getNombreMes(mesSeleccionado)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Día</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Beneficiario</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Edad Actual</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cumple</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Padre/Tutor</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cumpleanos.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 ${
                  esCumpleanosHoy(mesSeleccionado, item.dia, mesActual, diaActual)
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50'
                    : esCumpleanosPasado(mesSeleccionado, item.dia, mesActual, diaActual)
                    ? 'opacity-60'
                    : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    esCumpleanosHoy(mesSeleccionado, item.dia, mesActual, diaActual)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-pink-100 text-pink-600'
                  }`}>
                    {item.dia}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.nombre}</p>
                      {esCumpleanosHoy(mesSeleccionado, item.dia, mesActual, diaActual) && (
                        <span className="inline-flex items-center gap-1 text-xs text-pink-600 font-medium">
                          <Gift className="w-3 h-3" />
                          ¡Hoy cumple años!
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.codigo}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {item.edad} años
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    {item.edad + 1} años
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.padre_tutor || '-'}</td>
                <td className="px-6 py-4">
                  {item.telefono ? (
                    <span className="flex items-center gap-1 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {item.telefono}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
