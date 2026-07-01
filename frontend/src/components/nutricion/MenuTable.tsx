'use client';

import {
  Users, CheckCircle, UtensilsCrossed, Loader2, Sun, Moon,
} from 'lucide-react';
import type { Clase, ResumenClase, TandaNutricion } from '@/lib/types';
import { esHorarioMatutino } from '@/lib/utils/formatters';

interface MenuTableProps {
  diaSeleccionado: string;
  tanda: TandaNutricion;
  clasesFiltradas: Clase[];
  resumenFiltrado: ResumenClase[];
  totalPresentes: number;
  totalInscritos: number;
  loadingClases: boolean;
  onChangeTanda: (tanda: TandaNutricion) => void;
}

function esMatutina(hora: string) {
  return esHorarioMatutino(hora);
}

export default function MenuTable({
  diaSeleccionado,
  tanda,
  clasesFiltradas,
  resumenFiltrado,
  totalPresentes,
  totalInscritos,
  loadingClases,
  onChangeTanda,
}: MenuTableProps) {
  const diaSemanaSeleccionado = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][
    new Date(diaSeleccionado + 'T12:00:00').getDay()
  ];

  const stats = [
    {
      label: 'Total Presentes',
      value: totalPresentes,
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: <CheckCircle className="w-8 h-8 text-green-400" />,
    },
    {
      label: 'Total Inscritos',
      value: totalInscritos,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: <Users className="w-8 h-8 text-blue-400" />,
    },
    {
      label: 'Asistencia Global',
      value: totalInscritos > 0 ? `${((totalPresentes / totalInscritos) * 100).toFixed(1)}%` : '0%',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      icon: <UtensilsCrossed className="w-8 h-8 text-purple-400" />,
    },
  ];

  return (
    <>
      {/* Selector de Tanda */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Tanda:</span>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <button
            onClick={() => onChangeTanda('matutina')}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium transition-colors
              ${tanda === 'matutina' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-amber-50'}`}
          >
            <Sun className="w-4 h-4" />
            Matutina
          </button>
          <button
            onClick={() => onChangeTanda('vespertina')}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium transition-colors
              ${tanda === 'vespertina' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-indigo-50'}`}
          >
            <Moon className="w-4 h-4" />
            Vespertina
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center justify-between`}>
            <div>
              <p className="text-xs font-medium text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
            {s.icon}
          </div>
        ))}
      </div>

      {/* Tabla de clases */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Clases — Tanda {tanda === 'matutina' ? 'Matutina' : 'Vespertina'}
          </h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {new Date(diaSeleccionado + 'T12:00:00').toLocaleDateString('es-DO', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </span>
        </div>

        {loadingClases ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : clasesFiltradas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No hay clases {tanda === 'matutina' ? 'matutinas' : 'vespertinas'} activas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Clase', 'Tutor', 'Horario', 'Inscritos', 'Presentes', '% Asist.'].map(th => (
                    <th
                      key={th}
                      className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase ${th === 'Clase' || th === 'Tutor' || th === 'Horario' ? 'text-left' : 'text-center'}`}
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clasesFiltradas.map(clase => {
                  const r = resumenFiltrado.find(x => x.claseId === clase.id);
                  const inscritos = r?.totalInscritos ?? clase.beneficiarios?.length ?? 0;
                  const presentes = r?.totalPresentes ?? 0;
                  const pct = inscritos > 0 ? ((presentes / inscritos) * 100).toFixed(1) : '0';
                  const pctN = parseFloat(pct);
                  const horariosTanda = clase.horarios?.filter(h => {
                    const esMismoDia = h.dia?.toLowerCase() === diaSemanaSeleccionado;
                    const esMismaTanda = tanda === 'matutina' ? esMatutina(h.hora_inicio) : !esMatutina(h.hora_inicio);
                    return esMismoDia && esMismaTanda;
                  });

                  return (
                    <tr key={clase.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-900">{clase.nombre}</p>
                        {clase.codigo && <p className="text-xs text-gray-400">{clase.codigo}</p>}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {clase.tutor ? `${clase.tutor.nombre} ${clase.tutor.apellido ?? ''}`.trim() : '—'}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {horariosTanda?.map(h => `${h.hora_inicio.slice(0, 5)} - ${h.hora_fin.slice(0, 5)}`).join(', ') || '—'}
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-medium text-gray-700">{inscritos}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                          ${presentes > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          {presentes}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${pctN >= 80 ? 'bg-green-500' : pctN >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                              style={{ width: `${Math.min(pctN, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${pctN >= 80 ? 'text-green-700' : pctN >= 50 ? 'text-yellow-700' : 'text-red-600'}`}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
