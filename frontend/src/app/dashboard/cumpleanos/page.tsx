'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import CumpleanosFilters from '@/components/cumpleanos/CumpleanosFilters';
import CumpleanosList from '@/components/cumpleanos/CumpleanosList';
import { useCumpleanosPorMes } from '@/lib/hooks';
import { Cake, PartyPopper } from 'lucide-react';

const meses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export default function CumpleanosPage() {
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const { data: cumpleanos = [], isLoading, error } = useCumpleanosPorMes(mesSeleccionado);

  const mesActual = new Date().getMonth() + 1;
  const diaActual = new Date().getDate();

  const getNombreMes = (mes: number) => {
    return meses.find(m => m.value === mes)?.label || '';
  };

  return (
    <ProtectedRoute requiredPermisos={['cumpleanos:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Cake className="w-8 h-8 text-pink-500" />
              Cumpleaños
            </h1>
            <p className="text-gray-600 mt-1">
              Consulta los cumpleaños de los beneficiarios por mes
            </p>
          </div>

          {/* Alertas */}
          {error && (
            <Alert variant="error">
              {error instanceof Error ? error.message : 'Error al cargar cumpleaños'}
            </Alert>
          )}

          {/* Selector de Mes */}
          <CumpleanosFilters
            mesSeleccionado={mesSeleccionado}
            mesActual={mesActual}
            meses={meses}
            onMesChange={setMesSeleccionado}
          />

          {/* Resumen */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <PartyPopper className="w-6 h-6" />
                  Cumpleaños en {getNombreMes(mesSeleccionado)}
                </h2>
                <p className="text-pink-100 mt-1">
                  {cumpleanos.length} {cumpleanos.length === 1 ? 'beneficiario cumple' : 'beneficiarios cumplen'} años este mes
                </p>
              </div>
              <div className="text-5xl font-bold opacity-30">
                {cumpleanos.length}
              </div>
            </div>
          </div>

          {/* Lista de Cumpleaños */}
          <CumpleanosList
            cumpleanos={cumpleanos}
            isLoading={isLoading}
            mesSeleccionado={mesSeleccionado}
            mesActual={mesActual}
            diaActual={diaActual}
            getNombreMes={getNombreMes}
          />

          {/* Info */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Cake className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-pink-900 mb-1">Información</h4>
                <ul className="text-sm text-pink-700 space-y-1">
                  <li>• Los cumpleaños están ordenados por día del mes</li>
                  <li>• El mes actual está resaltado en el selector</li>
                  <li>• Los cumpleaños de hoy se muestran con un fondo especial</li>
                  <li>• <strong>Edad Actual</strong>: años que el beneficiario tiene hoy</li>
                  <li>• <strong>Cumple</strong>: edad que cumplirá en su próximo cumpleaños</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
