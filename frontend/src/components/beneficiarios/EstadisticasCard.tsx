'use client';

import Link from 'next/link';
import { BookOpen, Shield } from 'lucide-react';
import type { Clase, Supervivencia } from '@/lib/types';

interface EstadisticasCardProps {
  claseActiva?: Clase | null;
  cursoActivo?: Supervivencia | null;
}

export default function EstadisticasCard({ claseActiva, cursoActivo }: EstadisticasCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Clase Académica */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group/card hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Clase Académica</p>
            {claseActiva ? (
              <div>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{claseActiva.nombre}</h3>
                {claseActiva.codigo && <p className="text-xs text-gray-500 font-medium mt-0.5">Código: {claseActiva.codigo}</p>}
              </div>
            ) : (
              <h3 className="text-sm font-medium text-gray-400 mt-1">Sin clase asignada</h3>
            )}
          </div>
        </div>
        {claseActiva && (
          <Link href={`/dashboard/clases/${claseActiva.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all">
            Ver Clase
          </Link>
        )}
      </div>

      {/* Curso de Supervivencia */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group/card hover:border-emerald-200 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Curso de Supervivencia</p>
            {cursoActivo ? (
              <div>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{cursoActivo.nombre}</h3>
                {cursoActivo.codigo && <p className="text-xs text-gray-500 font-medium mt-0.5">Código: {cursoActivo.codigo}</p>}
              </div>
            ) : (
              <h3 className="text-sm font-medium text-gray-400 mt-1">Sin curso de supervivencia</h3>
            )}
          </div>
        </div>
        {cursoActivo && (
          <Link href={`/dashboard/supervivencia/${cursoActivo.id}`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-all">
            Ver Curso
          </Link>
        )}
      </div>
    </div>
  );
}
