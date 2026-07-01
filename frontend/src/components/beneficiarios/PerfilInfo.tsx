'use client';

import { Calendar, UserCircle, Phone, GraduationCap } from 'lucide-react';
import type { Beneficiario } from '@/lib/types';
import { formatearFechaLocal } from '@/lib/utils/formatters';

interface PerfilInfoProps {
  beneficiario: Beneficiario;
  expedientesLength: number;
  edad: number | null;
  tutorClase: string;
  onFotoClick: () => void;
}

export default function PerfilInfo({ beneficiario, expedientesLength, edad, tutorClase, onFotoClick }: PerfilInfoProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-36 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent)]" />
      </div>
      <div className="px-8 pb-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 mb-6 gap-4">
          <div className="flex items-end gap-5">
            <div className="relative flex-shrink-0">
              <div
                onClick={beneficiario.foto_url ? onFotoClick : undefined}
                className={`w-32 h-32 bg-white rounded-2xl p-1.5 shadow-lg border border-gray-100 overflow-hidden ${beneficiario.foto_url ? 'cursor-pointer' : ''}`}
              >
                {beneficiario.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={beneficiario.foto_url} alt={beneficiario.nombre} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
                    <UserCircle className="w-14 h-14 text-indigo-300" />
                  </div>
                )}
              </div>
            </div>
            <div className="pb-2">
              <h1 className="text-3xl font-bold text-gray-900">{beneficiario.nombre} {beneficiario.apellido}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">#{beneficiario.codigo}</span>
                {edad !== null && (
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{edad} años</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-5 mb-1">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{expedientesLength}</p>
              <p className="text-xs text-gray-500">Entradas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { icon: Calendar,    label: 'Nacimiento',     value: formatearFechaLocal(beneficiario.fecha_nacimiento) },
            { icon: UserCircle,  label: 'Padre / Tutor',  value: beneficiario.padre_tutor || 'No registrado' },
            { icon: Phone,       label: 'Teléfono',       value: beneficiario.telefono || 'No registrado' },
            { icon: GraduationCap, label: 'Profesor / Tutor', value: tutorClase },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
