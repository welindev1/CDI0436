'use client';

import { LogIn, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { Trabajador, AsistenciaPersonal } from '@/lib/api/asistencia-personal';

interface TrabajadorCardProps {
  trabajador: Trabajador;
  asistencia?: AsistenciaPersonal;
  onMarcarEntrada: (trabajadorId: string) => void;
  onMarcarSalida: (trabajadorId: string, fecha: string) => void;
}

export default function TrabajadorCard({
  trabajador,
  asistencia,
  onMarcarEntrada,
  onMarcarSalida,
}: TrabajadorCardProps) {
  const nombreCompleto = trabajador.apellido
    ? `${trabajador.nombre} ${trabajador.apellido}`
    : trabajador.nombre;

  const tieneEntrada = !!asistencia?.hora_entrada;
  const tieneSalida = !!asistencia?.hora_salida;

  let statusBadge: { label: string; className: string; dot?: boolean } = {
    label: 'Ausente',
    className: 'bg-gray-100 text-gray-700',
  };

  if (tieneEntrada && !tieneSalida) {
    statusBadge = {
      label: 'Presente',
      className: 'bg-green-100 text-green-700',
      dot: true,
    };
  } else if (tieneEntrada && tieneSalida) {
    statusBadge = {
      label: 'Completado',
      className: 'bg-blue-100 text-blue-700',
    };
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 truncate">{nombreCompleto}</h3>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
          {statusBadge.dot && (
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          {statusBadge.label}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        {tieneEntrada && (
          <div className="flex justify-between">
            <span>Entrada:</span>
            <span className="font-medium">{asistencia.hora_entrada}</span>
          </div>
        )}
        {tieneSalida && (
          <div className="flex justify-between">
            <span>Salida:</span>
            <span className="font-medium">{asistencia.hora_salida}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">
        {!tieneEntrada && (
          <Button
            onClick={() => onMarcarEntrada(trabajador.id)}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <LogIn className="w-4 h-4" />
            Entrada
          </Button>
        )}
        {tieneEntrada && !tieneSalida && (
          <Button
            onClick={() => onMarcarSalida(trabajador.id, asistencia.fecha)}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600"
          >
            <LogOut className="w-4 h-4" />
            Salida
          </Button>
        )}
      </div>
    </div>
  );
}
