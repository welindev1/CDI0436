'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ClaseFechaSelector from '@/components/asistencias/ClaseFechaSelector';
import RegistroAsistencia from '@/components/asistencias/RegistroAsistencia';
import GestionFotos from '@/components/asistencias/GestionFotos';
import { ClipboardCheck } from 'lucide-react';

export default function AsistenciasPage() {
  const [selectedClase, setSelectedClase] = useState<string | null>(null);
  const [selectedFecha, setSelectedFecha] = useState<string | null>(null);

  const handleSelect = (claseId: string, fecha: string) => {
    setSelectedClase(claseId);
    setSelectedFecha(fecha);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="w-7 h-7 text-blue-600" />
                Registro de Asistencias
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Selecciona una clase y luego la fecha para registrar asistencia
              </p>
            </div>
          </div>

          {/* Selector de clase y fecha */}
          <ClaseFechaSelector
            onSelect={handleSelect}
            initialClaseId={selectedClase || undefined}
            initialFecha={selectedFecha || undefined}
          />

          {/* Sección de fotos */}
          {selectedClase && selectedFecha && (
            <GestionFotos claseId={selectedClase} fecha={selectedFecha} />
          )}

          {/* Registro de asistencia */}
          {selectedClase && selectedFecha && (
            <RegistroAsistencia
              claseId={selectedClase}
              fecha={selectedFecha}
              onSaved={() => {}}
            />
          )}

          {/* Estado vacío */}
          {!selectedClase && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Selecciona una clase</h3>
              <p className="text-gray-400 text-sm">Elige la clase y la fecha para comenzar el registro de asistencia</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
