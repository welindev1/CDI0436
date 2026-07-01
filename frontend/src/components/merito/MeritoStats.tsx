'use client';

import { Award, Users, FileCheck, Clock } from 'lucide-react';

interface MeritoStatsProps {
  periodoNombre: string;
  totalFaltan: number;
  totalRegistradas: number;
}

export function MeritoStats({ periodoNombre, totalFaltan, totalRegistradas }: MeritoStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Período</p>
            <p className="text-lg font-bold text-gray-900">{periodoNombre}</p>
          </div>
          <Award className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Estudiantes</p>
            <p className="text-2xl font-bold text-gray-900">{totalFaltan + totalRegistradas}</p>
          </div>
          <Users className="w-8 h-8 text-indigo-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Notas Registradas</p>
            <p className="text-2xl font-bold text-green-600">{totalRegistradas}</p>
          </div>
          <FileCheck className="w-8 h-8 text-green-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-amber-600">{totalFaltan}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
      </div>
    </div>
  );
}
