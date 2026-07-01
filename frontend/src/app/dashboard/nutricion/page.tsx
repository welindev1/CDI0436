'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MenuCalendar from '@/components/nutricion/MenuCalendar';
import MenuTable from '@/components/nutricion/MenuTable';
import MenuForm from '@/components/nutricion/MenuForm';
import { asistenciasApi } from '@/lib/api/asistencias';
import { clasesApi } from '@/lib/api/clases';
import { nutricionApi } from '@/lib/api/nutricion';
import { UtensilsCrossed } from 'lucide-react';
import type { Clase, MenuNutricion, ResumenClase, TandaNutricion } from '@/lib/types';

// ─── Constantes ───────────────────────────────────────────────────────────────
const DIAS_NUTRICION = ['miercoles', 'jueves', 'viernes', 'sabado'] as const;
const NOMBRES_DIA: Record<string, string> = {
  miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado',
};
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDiasDelMes(anio: number, mes: number) {
  const dias: { fecha: string; diaNombre: string; diaNum: number }[] = [];
  const totalDias = new Date(anio, mes + 1, 0).getDate();
  for (let d = 1; d <= totalDias; d++) {
    const date = new Date(anio, mes, d);
    const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][date.getDay()];
    if ((DIAS_NUTRICION as readonly string[]).includes(diaSemana)) {
      const yyyy = anio;
      const mm = String(mes + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      dias.push({ fecha: `${yyyy}-${mm}-${dd}`, diaNombre: NOMBRES_DIA[diaSemana], diaNum: d });
    }
  }
  return dias;
}

function esMatutina(hora: string) {
  const h = parseInt(hora?.split(':')[0] ?? '12');
  return h < 12;
}

export default function NutricionPage() {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [tanda, setTanda] = useState<TandaNutricion>('matutina');
  const [clases, setClases] = useState<Clase[]>([]);
  const [resumen, setResumen] = useState<ResumenClase[]>([]);
  const [menu, setMenu] = useState<MenuNutricion | null>(null);
  const [menusMes, setMenusMes] = useState<MenuNutricion[]>([]);
  const [loadingClases, setLoadingClases] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const diasDelMes = useMemo(() => getDiasDelMes(anio, mes), [anio, mes]);

  // Cargar menús del mes
  const cargarMenusMes = useCallback(async () => {
    try {
      const data = await nutricionApi.getByMes(anio, mes + 1);
      setMenusMes(data);
    } catch { /* silencioso */ }
  }, [anio, mes]);

  useEffect(() => { cargarMenusMes(); }, [cargarMenusMes]);

  // Cargar clases y menú del día seleccionado
  useEffect(() => {
    if (!diaSeleccionado) {
      setClases([]);
      setResumen([]);
      setMenu(null);
      return;
    }
    const cargar = async () => {
      setLoadingClases(true);
      setLoadingMenu(true);
      try {
        const [todasClases, resumenData, menuData] = await Promise.all([
          clasesApi.getAll({ activo: 'true' }),
          asistenciasApi.getResumenPorFecha(diaSeleccionado),
          nutricionApi.getByFechaYTanda(diaSeleccionado, tanda),
        ]);
        setClases(todasClases);
        setResumen(resumenData);
        setMenu(menuData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingClases(false);
        setLoadingMenu(false);
      }
    };
    cargar();
  }, [diaSeleccionado, tanda]);

  // Filtrar clases por tanda y día
  const diaSemanaSeleccionado = diaSeleccionado
    ? ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][
        new Date(diaSeleccionado + 'T12:00:00').getDay()
      ]
    : null;

  const clasesFiltradas = clases.filter(c => {
    const horariosDelDia = c.horarios?.filter(h => h.dia?.toLowerCase() === diaSemanaSeleccionado);
    if (!horariosDelDia || horariosDelDia.length === 0) return false;
    return horariosDelDia.some(h => tanda === 'matutina' ? esMatutina(h.hora_inicio) : !esMatutina(h.hora_inicio));
  });

  const resumenFiltrado = resumen.filter(r => clasesFiltradas.some(c => c.id === r.claseId));
  const totalPresentes = resumenFiltrado.reduce((a, c) => a + c.totalPresentes, 0);
  const totalInscritos = resumenFiltrado.reduce((a, c) => a + c.totalInscritos, 0);

  // Handlers
  const cambiarMes = (delta: number) => {
    const d = new Date(anio, mes + delta);
    setAnio(d.getFullYear());
    setMes(d.getMonth());
    setDiaSeleccionado(null);
  };

  const tieneMenuEseDia = (fecha: string, t: TandaNutricion) =>
    menusMes.some(m => m.fecha.startsWith(fecha) && m.tanda === t);

  const handleGuardarMenu = async (data: { titulo: string; meriendas: string; observaciones: string }) => {
    if (menu) {
      const saved = await nutricionApi.update(menu.id, {
        titulo_menu: data.titulo,
        meriendas_servidas: data.meriendas ? parseInt(data.meriendas) : undefined,
        observaciones: data.observaciones || undefined,
      });
      setMenu(saved);
    } else {
      const saved = await nutricionApi.create({
        fecha: diaSeleccionado!,
        tanda,
        titulo_menu: data.titulo,
        meriendas_servidas: data.meriendas ? parseInt(data.meriendas) : undefined,
        observaciones: data.observaciones || undefined,
      });
      setMenu(saved);
    }
    await cargarMenusMes();
  };

  const handleEliminarMenu = async () => {
    if (!menu || !confirm('¿Eliminar este menú?')) return;
    try {
      await nutricionApi.delete(menu.id);
      setMenu(null);
      await cargarMenusMes();
    } catch { alert('Error al eliminar el menú'); }
  };

  const mesLabel = `${MESES[mes]} ${anio}`;

  return (
    <ProtectedRoute requiredPermisos={['nutricion:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UtensilsCrossed className="w-7 h-7 text-green-600" />
                Nutrición
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Miércoles · Jueves · Viernes · Sábado — Registro de menús y asistencia
              </p>
            </div>
          </div>

          {/* Calendar */}
          <MenuCalendar
            mesLabel={mesLabel}
            diasDelMes={diasDelMes}
            diaSeleccionado={diaSeleccionado}
            tieneMenuEseDia={tieneMenuEseDia}
            onSelectDia={setDiaSeleccionado}
            onCambiarMes={cambiarMes}
          />

          {/* Day content */}
          {diaSeleccionado && (
            <>
              <MenuTable
                diaSeleccionado={diaSeleccionado}
                tanda={tanda}
                clasesFiltradas={clasesFiltradas}
                resumenFiltrado={resumenFiltrado}
                totalPresentes={totalPresentes}
                totalInscritos={totalInscritos}
                loadingClases={loadingClases}
                onChangeTanda={setTanda}
              />

              <MenuForm
                diaSeleccionado={diaSeleccionado}
                tanda={tanda}
                menu={menu}
                loadingMenu={loadingMenu}
                onSave={handleGuardarMenu}
                onDelete={handleEliminarMenu}
                onOpenCreate={() => {}}
                onOpenEdit={() => {}}
              />
            </>
          )}

          {/* Empty state */}
          {!diaSeleccionado && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <UtensilsCrossed className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Selecciona un día del calendario para ver el resumen</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
