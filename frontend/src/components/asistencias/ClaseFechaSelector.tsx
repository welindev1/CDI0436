'use client';

import { useState, useEffect, useMemo } from 'react';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { clasesApi } from '@/lib/api/clases';
import { Clase, DiaSemana } from '@/lib/types';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface ClaseFechaSelectorProps {
  onSelect: (claseId: string, fecha: string) => void;
  initialClaseId?: string;
  initialFecha?: string;
}

// Mapeo de DiaSemana a número de día de la semana (0 = Domingo, 1 = Lunes, etc.)
const diaToNumber: Record<DiaSemana, number> = {
  [DiaSemana.DOMINGO]: 0,
  [DiaSemana.LUNES]: 1,
  [DiaSemana.MARTES]: 2,
  [DiaSemana.MIERCOLES]: 3,
  [DiaSemana.JUEVES]: 4,
  [DiaSemana.VIERNES]: 5,
  [DiaSemana.SABADO]: 6,
};

// Nombres de los días en español
const nombresDias: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

// Nombres de los meses
const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ClaseFechaSelector({
  onSelect,
  initialClaseId,
  initialFecha
}: ClaseFechaSelectorProps) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [claseId, setClaseId] = useState(initialClaseId || '');
  const [fecha, setFecha] = useState(initialFecha || '');
  const [mesActual, setMesActual] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadClases();
  }, []);

  // Resetear fecha cuando cambia la clase
  useEffect(() => {
    setFecha('');
  }, [claseId]);

  const loadClases = async () => {
    try {
      const data = await clasesApi.getAll({ activo: true });
      setClases(data);
    } catch (err) {
      console.error('Error al cargar clases', err);
    }
  };

  // Obtener la clase seleccionada
  const claseSeleccionada = useMemo(() => {
    return clases.find(c => c.id === claseId);
  }, [clases, claseId]);

  // Obtener los días de la semana en que la clase tiene sesión
  const diasDeClase = useMemo(() => {
    if (!claseSeleccionada?.horarios) return [];
    return claseSeleccionada.horarios
      .filter(h => h.activo)
      .map(h => diaToNumber[h.dia]);
  }, [claseSeleccionada]);

  // Generar las fechas del mes que coinciden con los días de clase
  const fechasDisponibles = useMemo(() => {
    if (diasDeClase.length === 0) return [];

    const fechas: { value: string; label: string; date: Date }[] = [];
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();

    // Obtener el último día del mes
    const ultimoDia = new Date(year, month + 1, 0).getDate();

    for (let dia = 1; dia <= ultimoDia; dia++) {
      const date = new Date(year, month, dia);
      const diaSemana = date.getDay();

      if (diasDeClase.includes(diaSemana)) {
        const fechaStr = date.toISOString().split('T')[0];
        fechas.push({
          value: fechaStr,
          label: `${nombresDias[diaSemana]} ${dia}`,
          date
        });
      }
    }

    return fechas;
  }, [diasDeClase, mesActual]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claseId && fecha) {
      onSelect(claseId, fecha);
    }
  };

  const handleMesAnterior = () => {
    setMesActual(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setFecha('');
  };

  const handleMesSiguiente = () => {
    setMesActual(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setFecha('');
  };

  const claseOptions = clases.map(c => ({
    value: c.id,
    label: `${c.nombre} ${c.codigo ? `(${c.codigo})` : ''}`
  }));

  const fechaOptions = fechasDisponibles.map(f => ({
    value: f.value,
    label: f.label
  }));

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selector de Clase */}
        <div className="md:col-span-1">
          <Select
            label="Clase"
            name="claseId"
            value={claseId}
            onChange={(e) => setClaseId(e.target.value)}
            options={claseOptions}
            required
          />
        </div>

        {/* Selector de Mes y Fecha */}
        <div className="md:col-span-2">
          {claseId ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Clase
              </label>

              {/* Navegación de mes */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleMesAnterior}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="flex-1 text-center font-medium text-gray-900">
                  {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={handleMesSiguiente}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Días de clase disponibles */}
              {fechasDisponibles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {fechasDisponibles.map((f) => {
                    const esHoy = f.value === new Date().toISOString().split('T')[0];
                    const seleccionado = fecha === f.value;

                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFecha(f.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          seleccionado
                            ? 'bg-blue-600 text-white shadow-md'
                            : esHoy
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 ring-2 ring-blue-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {f.label}
                        {esHoy && <span className="ml-1 text-xs">(Hoy)</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-lg">
                  {claseSeleccionada?.horarios?.length === 0
                    ? 'Esta clase no tiene horarios configurados'
                    : 'No hay días de clase en este mes'
                  }
                </div>
              )}

              {/* Mostrar los días de clase */}
              {claseSeleccionada?.horarios && claseSeleccionada.horarios.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Días de clase: {claseSeleccionada.horarios
                    .filter(h => h.activo)
                    .map(h => h.dia.charAt(0).toUpperCase() + h.dia.slice(1))
                    .join(', ')
                  }
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">
                Selecciona una clase para ver las fechas disponibles
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          type="submit"
          disabled={!claseId || !fecha || isLoading}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Cargar Lista
        </Button>
      </div>
    </form>
  );
}
