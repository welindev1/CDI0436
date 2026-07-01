'use client';

import { BookOpen, UserCircle, Calendar, Users } from 'lucide-react';
import type { Clase } from '@/lib/types';
import { getTurnoLabel } from '@/lib/utils/formatters';

const diasLabel: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

interface ClaseInfoProps {
  clase: Clase;
}

export default function ClaseInfo({ clase }: ClaseInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Información general */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Información General
        </h2>

        <div className="space-y-3">
          {clase.descripcion && (
            <div>
              <p className="text-sm font-medium text-gray-700">Descripción</p>
              <p className="text-gray-600">{clase.descripcion}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
              <UserCircle className="w-4 h-4" />
              Tutor
            </p>
            <p className="text-gray-600">
              {clase.tutor?.nombre} {clase.tutor?.apellido}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              Horarios
            </p>
            <div className="space-y-1">
              {clase.horarios?.map((h, idx) => (
                <p key={idx} className="text-gray-600">
                  {diasLabel[h.dia] || h.dia} — {getTurnoLabel(h.hora_inicio)}
                </p>
              ))}
              {(!clase.horarios || clase.horarios.length === 0) && (
                <p className="text-gray-400 italic">Sin horarios asignados</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" />
              Capacidad
            </p>
            <p className="text-gray-600">
              {clase.beneficiarios?.length || 0}
              {clase.capacidad_maxima > 0 && ` / ${clase.capacidad_maxima}`} inscrito(s)
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Estado</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              clase.activo
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {clase.activo ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-900">Total Inscritos</span>
            <span className="text-2xl font-bold text-blue-600">
              {clase.beneficiarios?.length || 0}
            </span>
          </div>

          {clase.capacidad_maxima > 0 && (
            <>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">Cupos Disponibles</span>
                <span className="text-2xl font-bold text-green-600">
                  {clase.capacidad_maxima - (clase.beneficiarios?.length || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">% Ocupación</span>
                <span className="text-2xl font-bold text-purple-600">
                  {Math.round(((clase.beneficiarios?.length || 0) / clase.capacidad_maxima) * 100)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
