'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ClaseFechaSelector from '@/components/asistencias/ClaseFechaSelector';
import RegistroAsistencia from '@/components/asistencias/RegistroAsistencia';
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
              Registro de Asistencias
            </h1>
            <p className="text-gray-600 mt-1">
              Selecciona una clase y fecha para registrar la asistencia
            </p>
          </div>

          {/* Selector de clase y fecha */}
          <ClaseFechaSelector
            onSelect={handleSelect}
            initialClaseId={selectedClase || undefined}
            initialFecha={selectedFecha || undefined}
          />

          {/* Registro de asistencia */}
          {selectedClase && selectedFecha && (
            <RegistroAsistencia
              claseId={selectedClase}
              fecha={selectedFecha}
              onSaved={() => {
                // Opcional: recargar o mostrar mensaje
              }}
            />
          )}

          {!selectedClase && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una clase y fecha
              </h3>
              <p className="text-gray-600">
                Usa el selector de arriba para comenzar a registrar asistencias
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}