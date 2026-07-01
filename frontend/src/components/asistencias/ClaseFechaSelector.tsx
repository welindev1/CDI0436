'use client';

import { useState, useEffect, useMemo } from 'react';
import { clasesApi } from '@/lib/api/clases';
import { Clase, DiaSemana } from '@/lib/types';
import { BookOpen, ChevronLeft, ChevronRight, Search, Users, Clock, User } from 'lucide-react';

interface ClaseFechaSelectorProps {
  onSelect: (claseId: string, fecha: string) => void;
  initialClaseId?: string;
  initialFecha?: string;
}

const diaToNumber: Record<DiaSemana, number> = {
  [DiaSemana.DOMINGO]: 0,
  [DiaSemana.LUNES]: 1,
  [DiaSemana.MARTES]: 2,
  [DiaSemana.MIERCOLES]: 3,
  [DiaSemana.JUEVES]: 4,
  [DiaSemana.VIERNES]: 5,
  [DiaSemana.SABADO]: 6,
};

const nombresDias: Record<number, string> = {
  0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb',
};

const nombresMeses = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const CLASE_COLORS = [
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-emerald-600',
  'from-rose-500 to-rose-600',
  'from-amber-500 to-amber-600',
  'from-cyan-500 to-cyan-600',
  'from-indigo-500 to-indigo-600',
  'from-pink-500 to-pink-600',
];

export default function ClaseFechaSelector({ onSelect, initialClaseId, initialFecha }: ClaseFechaSelectorProps) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [claseId, setClaseId] = useState(initialClaseId || '');
  const [fecha, setFecha] = useState(initialFecha || '');
  const [mesActual, setMesActual] = useState(new Date());
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadClases(); }, []);

  useEffect(() => { setFecha(''); }, [claseId]);

  const loadClases = async () => {
    try {
      setIsLoading(true);
      const data = await clasesApi.getAll({ activo: 'true' });
      setClases(data);
    } catch (err) {
      console.error('Error al cargar clases', err);
    } finally {
      setIsLoading(false);
    }
  };

  const claseSeleccionada = useMemo(() => clases.find(c => c.id === claseId), [clases, claseId]);

  const diasDeClase = useMemo(() => {
    if (!claseSeleccionada?.horarios) return [];
    return claseSeleccionada.horarios.filter(h => h.activo).map(h => diaToNumber[h.dia]);
  }, [claseSeleccionada]);

  const fechasDisponibles = useMemo(() => {
    if (diasDeClase.length === 0) return [];
    const fechas: { value: string; diaNombre: string; diaNum: number }[] = [];
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const ultimoDia = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= ultimoDia; d++) {
      const date = new Date(year, month, d);
      if (diasDeClase.includes(date.getDay())) {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        fechas.push({
          value: `${year}-${mm}-${dd}`,
          diaNombre: nombresDias[date.getDay()],
          diaNum: d,
        });
      }
    }
    return fechas;
  }, [diasDeClase, mesActual]);

  const clasesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return clases;
    const t = busqueda.toLowerCase();
    return clases.filter(c =>
      c.nombre.toLowerCase().includes(t) ||
      (c.codigo?.toLowerCase().includes(t)) ||
      (`${c.tutor?.nombre} ${c.tutor?.apellido ?? ''}`.toLowerCase().includes(t))
    );
  }, [clases, busqueda]);

  const handleCargar = () => {
    if (claseId && fecha) onSelect(claseId, fecha);
  };

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* ── Selector de Clase ──────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Seleccionar Clase
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Elige la clase para registrar asistencia</p>
        </div>

        {/* Búsqueda */}
        <div className="px-6 py-3 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código o tutor..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Grid de clases */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : clasesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No se encontraron clases</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {clasesFiltradas.map((clase, idx) => {
                const seleccionada = claseId === clase.id;
                const gradiente = CLASE_COLORS[idx % CLASE_COLORS.length];
                const horarioTexto = clase.horarios
                  ?.filter(h => h.activo)
                  .map(h => h.dia.charAt(0).toUpperCase() + h.dia.slice(1))
                  .join(', ') || 'Sin horario';

                return (
                  <button
                    key={clase.id}
                    onClick={() => setClaseId(seleccionada ? '' : clase.id)}
                    className={`relative text-left rounded-xl border-2 transition-all duration-200 overflow-hidden group
                      ${seleccionada
                        ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-[1.02]'
                        : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
                      }`}
                  >
                    {/* Franja de color arriba */}
                    <div className={`h-1.5 bg-gradient-to-r ${gradiente} w-full`} />

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                            {clase.nombre}
                          </p>
                          {clase.codigo && (
                            <span className="inline-block text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-1">
                              {clase.codigo}
                            </span>
                          )}
                        </div>
                        {seleccionada && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {clase.tutor ? `${clase.tutor.nombre} ${clase.tutor.apellido ?? ''}`.trim() : 'Sin tutor'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{horarioTexto}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Users className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{clase.beneficiarios?.length ?? 0} beneficiarios</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Selector de Fecha ─────────────────────────────────── */}
      {claseId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ChevronLeft className="w-0 h-0 hidden" />
              📅 Seleccionar Fecha
            </h2>
            {claseSeleccionada?.horarios && claseSeleccionada.horarios.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                Días de clase: {claseSeleccionada.horarios.filter(h => h.activo).map(h => h.dia.charAt(0).toUpperCase() + h.dia.slice(1)).join(', ')}
              </p>
            )}
          </div>

          {/* Navegación de mes */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-50">
            <button
              onClick={() => { setMesActual(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)); setFecha(''); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-bold text-gray-900">
              {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
            </span>
            <button
              onClick={() => { setMesActual(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)); setFecha(''); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Días disponibles */}
          <div className="p-5">
            {fechasDisponibles.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No hay días de clase en este mes</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {fechasDisponibles.map(({ value, diaNombre, diaNum }) => {
                  const seleccionado = fecha === value;
                  const esHoy = value === hoy;
                  return (
                    <button
                      key={value}
                      onClick={() => setFecha(seleccionado ? '' : value)}
                      className={`flex flex-col items-center py-2.5 px-1 rounded-xl border-2 transition-all font-medium text-center
                        ${seleccionado
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                          : esHoy
                          ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${seleccionado ? 'text-blue-100' : esHoy ? 'text-blue-500' : 'text-gray-400'}`}>
                        {diaNombre}
                      </span>
                      <span className="text-lg font-bold leading-none mt-0.5">{diaNum}</span>
                      {esHoy && (
                        <span className={`text-[9px] mt-0.5 font-bold ${seleccionado ? 'text-blue-200' : 'text-blue-500'}`}>HOY</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón cargar */}
          {fecha && (
            <div className="px-5 pb-5">
              <button
                onClick={handleCargar}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                <BookOpen className="w-5 h-5" />
                Cargar Asistencia — {new Date(fecha + 'T12:00:00').toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
