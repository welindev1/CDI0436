'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { asistenciasApi } from '@/lib/api/asistencias';
import { clasesApi } from '@/lib/api/clases';
import { nutricionApi, MenuNutricion, TandaNutricion } from '@/lib/api/nutricion';
import { Clase } from '@/lib/types';
import {
  UtensilsCrossed, Users, CheckCircle, ChevronLeft, ChevronRight,
  Sun, Moon, Plus, Edit2, Trash2, Save, X, Loader2, UtensilsCrossed as Fork
} from 'lucide-react';

// ─── Constantes ───────────────────────────────────────────────────────────────
const DIAS_NUTRICION = ['miercoles', 'jueves', 'viernes', 'sabado'] as const;
const NOMBRES_DIA: Record<string, string> = {
  miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado',
};
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDiasDelMes(anio: number, mes: number) {
  // mes es 0-indexed aquí
  const dias: { fecha: string; diaNombre: string; diaNum: number }[] = [];
  const totalDias = new Date(anio, mes + 1, 0).getDate();

  for (let d = 1; d <= totalDias; d++) {
    const date = new Date(anio, mes, d);
    const diaSemana = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][date.getDay()];
    if (DIAS_NUTRICION.includes(diaSemana as any)) {
      const yyyy = anio;
      const mm = String(mes + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      dias.push({
        fecha: `${yyyy}-${mm}-${dd}`,
        diaNombre: NOMBRES_DIA[diaSemana],
        diaNum: d,
      });
    }
  }
  return dias;
}

function esMatutina(hora: string) {
  const h = parseInt(hora?.split(':')[0] ?? '12');
  return h < 12;
}

// ─── Tipos locales ────────────────────────────────────────────────────────────
interface ResumenClase {
  claseId: string;
  nombre: string;
  codigo: string | null;
  tutor: string | null;
  totalInscritos: number;
  totalPresentes: number;
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NutricionPage() {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth()); // 0-indexed

  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [tanda, setTanda] = useState<TandaNutricion>('matutina');

  const [clases, setClases] = useState<Clase[]>([]);
  const [resumen, setResumen] = useState<ResumenClase[]>([]);
  const [menu, setMenu] = useState<MenuNutricion | null>(null);
  const [menusMes, setMenusMes] = useState<MenuNutricion[]>([]);

  const [loadingClases, setLoadingClases] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Modal menú
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuNutricion | null>(null);
  const [formTitulo, setFormTitulo] = useState('');
  const [formMeriendas, setFormMeriendas] = useState('');
  const [formObservaciones, setFormObservaciones] = useState('');
  const [savingMenu, setSavingMenu] = useState(false);
  const [menuError, setMenuError] = useState('');

  const diasDelMes = getDiasDelMes(anio, mes);

  // ── Cargar menús del mes ────────────────────────────────────────────────────
  const cargarMenusMes = useCallback(async () => {
    try {
      const data = await nutricionApi.getByMes(anio, mes + 1);
      setMenusMes(data);
    } catch { /* silencioso */ }
  }, [anio, mes]);

  useEffect(() => { cargarMenusMes(); }, [cargarMenusMes]);

  // ── Cargar clases y menú del día seleccionado ───────────────────────────────
  useEffect(() => {
    if (!diaSeleccionado) {
      setClases([]); setResumen([]); setMenu(null);
      return;
    }

    const cargar = async () => {
      setLoadingClases(true);
      setLoadingMenu(true);
      try {
        const [todasClases, resumenData, menuData] = await Promise.all([
          clasesApi.getAll({ activo: true }),
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

  // ── Filtrar clases por tanda ────────────────────────────────────────────────
  const clasesFiltradas = clases.filter(c =>
    c.horarios?.some(h => tanda === 'matutina' ? esMatutina(h.hora_inicio) : !esMatutina(h.hora_inicio))
  );

  const resumenFiltrado = resumen.filter(r =>
    clasesFiltradas.some(c => c.id === r.claseId)
  );

  const totalPresentes = resumenFiltrado.reduce((a, c) => a + c.totalPresentes, 0);
  const totalInscritos = resumenFiltrado.reduce((a, c) => a + c.totalInscritos, 0);

  // ── Menú modal ──────────────────────────────────────────────────────────────
  const abrirCrearMenu = () => {
    setEditingMenu(null);
    setFormTitulo('');
    setFormMeriendas('');
    setFormObservaciones('');
    setMenuError('');
    setShowMenuModal(true);
  };

  const abrirEditarMenu = (m: MenuNutricion) => {
    setEditingMenu(m);
    setFormTitulo(m.titulo_menu);
    setFormMeriendas(m.meriendas_servidas?.toString() ?? '');
    setFormObservaciones(m.observaciones ?? '');
    setMenuError('');
    setShowMenuModal(true);
  };

  const handleGuardarMenu = async () => {
    if (!formTitulo.trim()) { setMenuError('El título del menú es requerido'); return; }
    setSavingMenu(true);
    setMenuError('');
    try {
      let saved: MenuNutricion;
      if (editingMenu) {
        saved = await nutricionApi.update(editingMenu.id, {
          titulo_menu: formTitulo.trim(),
          meriendas_servidas: formMeriendas ? parseInt(formMeriendas) : undefined,
          observaciones: formObservaciones || undefined,
        });
      } else {
        saved = await nutricionApi.create({
          fecha: diaSeleccionado!,
          tanda,
          titulo_menu: formTitulo.trim(),
          meriendas_servidas: formMeriendas ? parseInt(formMeriendas) : undefined,
          observaciones: formObservaciones || undefined,
        });
      }
      setMenu(saved);
      await cargarMenusMes();
      setShowMenuModal(false);
    } catch (err: any) {
      setMenuError(err.response?.data?.message || 'Error al guardar el menú');
    } finally {
      setSavingMenu(false);
    }
  };

  const handleEliminarMenu = async () => {
    if (!menu || !confirm('¿Eliminar este menú?')) return;
    try {
      await nutricionApi.delete(menu.id);
      setMenu(null);
      await cargarMenusMes();
    } catch { alert('Error al eliminar el menú'); }
  };

  // ── Helpers UI ──────────────────────────────────────────────────────────────
  const mesLabel = `${MESES[mes]} ${anio}`;
  const cambiarMes = (delta: number) => {
    const d = new Date(anio, mes + delta);
    setAnio(d.getFullYear());
    setMes(d.getMonth());
    setDiaSeleccionado(null);
  };

  const tieneMenuEseDia = (fecha: string, t: TandaNutricion) =>
    menusMes.some(m => m.fecha.startsWith(fecha) && m.tanda === t);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute requiredPermisos={['nutricion:ver']}>
      <DashboardLayout>
        <div className="space-y-6">

          {/* ── Header ──────────────────────────────────────────────────────── */}
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

          {/* ── Selector de Mes ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => cambiarMes(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-bold text-gray-900">{mesLabel}</h2>
              <button
                onClick={() => cambiarMes(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Grid de días */}
            {diasDelMes.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No hay días disponibles este mes</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {diasDelMes.map(({ fecha, diaNombre, diaNum }) => {
                  const seleccionado = diaSeleccionado === fecha;
                  const tieneM = tieneMenuEseDia(fecha, 'matutina');
                  const tieneV = tieneMenuEseDia(fecha, 'vespertina');
                  return (
                    <button
                      key={fecha}
                      onClick={() => setDiaSeleccionado(seleccionado ? null : fecha)}
                      className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all font-medium
                        ${seleccionado
                          ? 'bg-green-600 border-green-600 text-white shadow-lg scale-105'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
                        }`}
                    >
                      <span className={`text-xs mb-1 ${seleccionado ? 'text-green-100' : 'text-gray-400'}`}>
                        {diaNombre}
                      </span>
                      <span className="text-2xl font-bold">{diaNum}</span>
                      {/* Indicadores de menú */}
                      <div className="flex gap-1 mt-2">
                        <span className={`w-2 h-2 rounded-full ${tieneM ? 'bg-yellow-400' : seleccionado ? 'bg-green-400' : 'bg-gray-200'}`} title="Matutina" />
                        <span className={`w-2 h-2 rounded-full ${tieneV ? 'bg-indigo-400' : seleccionado ? 'bg-green-400' : 'bg-gray-200'}`} title="Vespertina" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Leyenda */}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />Menú matutino</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" />Menú vespertino</span>
            </div>
          </div>

          {/* ── Contenido del día seleccionado ───────────────────────────────── */}
          {diaSeleccionado && (
            <>
              {/* Selector de Tanda */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Tanda:</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <button
                    onClick={() => setTanda('matutina')}
                    className={`flex items-center gap-2 px-5 py-2 text-sm font-medium transition-colors
                      ${tanda === 'matutina' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-amber-50'}`}
                  >
                    <Sun className="w-4 h-4" />
                    Matutina
                  </button>
                  <button
                    onClick={() => setTanda('vespertina')}
                    className={`flex items-center gap-2 px-5 py-2 text-sm font-medium transition-colors
                      ${tanda === 'vespertina' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-indigo-50'}`}
                  >
                    <Moon className="w-4 h-4" />
                    Vespertina
                  </button>
                </div>
              </div>

              {/* Stats del día */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Presentes', value: totalPresentes, color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle className="w-8 h-8 text-green-400" /> },
                  { label: 'Total Inscritos', value: totalInscritos, color: 'text-blue-600', bg: 'bg-blue-50', icon: <Users className="w-8 h-8 text-blue-400" /> },
                  { label: 'Asistencia Global', value: totalInscritos > 0 ? `${((totalPresentes / totalInscritos) * 100).toFixed(1)}%` : '0%', color: 'text-purple-600', bg: 'bg-purple-50', icon: <UtensilsCrossed className="w-8 h-8 text-purple-400" /> },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center justify-between`}>
                    <div>
                      <p className="text-xs font-medium text-gray-500">{s.label}</p>
                      <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                    {s.icon}
                  </div>
                ))}
              </div>

              {/* Tabla de clases */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Clases — Tanda {tanda === 'matutina' ? 'Matutina ☀️' : 'Vespertina 🌙'}
                  </h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {new Date(diaSeleccionado + 'T12:00:00').toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>

                {loadingClases ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                  </div>
                ) : clasesFiltradas.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No hay clases {tanda === 'matutina' ? 'matutinas' : 'vespertinas'} activas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Clase', 'Tutor', 'Horario', 'Inscritos', 'Presentes', '% Asist.'].map(th => (
                            <th key={th} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase ${th === 'Clase' || th === 'Tutor' || th === 'Horario' ? 'text-left' : 'text-center'}`}>
                              {th}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {clasesFiltradas.map(clase => {
                          const r = resumenFiltrado.find(x => x.claseId === clase.id);
                          const inscritos = r?.totalInscritos ?? clase.beneficiarios?.length ?? 0;
                          const presentes = r?.totalPresentes ?? 0;
                          const pct = inscritos > 0 ? ((presentes / inscritos) * 100).toFixed(1) : '0';
                          const pctN = parseFloat(pct);
                          const horariosTanda = clase.horarios?.filter(h =>
                            tanda === 'matutina' ? esMatutina(h.hora_inicio) : !esMatutina(h.hora_inicio)
                          );

                          return (
                            <tr key={clase.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-3">
                                <p className="text-sm font-medium text-gray-900">{clase.nombre}</p>
                                {clase.codigo && <p className="text-xs text-gray-400">{clase.codigo}</p>}
                              </td>
                              <td className="px-5 py-3 text-sm text-gray-600">
                                {clase.tutor ? `${clase.tutor.nombre} ${clase.tutor.apellido ?? ''}`.trim() : '—'}
                              </td>
                              <td className="px-5 py-3 text-xs text-gray-500">
                                {horariosTanda?.map(h => `${h.hora_inicio.slice(0,5)} - ${h.hora_fin.slice(0,5)}`).join(', ') || '—'}
                              </td>
                              <td className="px-5 py-3 text-center text-sm font-medium text-gray-700">{inscritos}</td>
                              <td className="px-5 py-3 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                  ${presentes > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                  {presentes}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${pctN >= 80 ? 'bg-green-500' : pctN >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                                      style={{ width: `${Math.min(pctN, 100)}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs font-medium ${pctN >= 80 ? 'text-green-700' : pctN >= 50 ? 'text-yellow-700' : 'text-red-600'}`}>
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Sección Menú del Día ──────────────────────────────────────── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Fork className="w-5 h-5 text-green-600" />
                    Menú del Día — {tanda === 'matutina' ? 'Tanda Matutina ☀️' : 'Tanda Vespertina 🌙'}
                  </h3>
                  {!loadingMenu && (
                    menu ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirEditarMenu(menu)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={handleEliminarMenu}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={abrirCrearMenu}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Agregar Menú
                      </button>
                    )
                  )}
                </div>

                <div className="p-6">
                  {loadingMenu ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                    </div>
                  ) : menu ? (
                    <div className="space-y-4">
                      {/* Título del menú */}
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Fork className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wide">Menú del día</p>
                          <h4 className="text-xl font-bold text-gray-900">{menu.titulo_menu}</h4>
                        </div>
                      </div>

                      {/* Detalle de meriendas y observaciones */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Meriendas Servidas</p>
                          {menu.meriendas_servidas !== null ? (
                            <p className="text-3xl font-bold text-amber-600">{menu.meriendas_servidas}</p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm">Sin registrar</span>
                              <button
                                onClick={() => abrirEditarMenu(menu)}
                                className="text-xs text-amber-600 underline hover:no-underline"
                              >
                                Agregar
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Observaciones</p>
                          {menu.observaciones ? (
                            <p className="text-sm text-gray-700">{menu.observaciones}</p>
                          ) : (
                            <span className="text-gray-400 text-sm italic">Sin observaciones</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Fork className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No hay menú registrado para esta fecha y tanda</p>
                      <p className="text-sm text-gray-400 mt-1">Haz click en "Agregar Menú" para registrarlo</p>
                      <button
                        onClick={abrirCrearMenu}
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Agregar Menú
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Estado vacío inicial */}
          {!diaSeleccionado && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <UtensilsCrossed className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Selecciona un día del calendario para ver el resumen</p>
            </div>
          )}
        </div>

        {/* ── Modal Menú ────────────────────────────────────────────────────── */}
        {showMenuModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">
                  {editingMenu ? 'Editar Menú' : 'Nuevo Menú'}
                </h3>
                <button onClick={() => setShowMenuModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {menuError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {menuError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del Menú <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitulo}
                    onChange={e => setFormTitulo(e.target.value)}
                    placeholder="Ej: Arroz Blanco con Huevo"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meriendas Servidas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMeriendas}
                    onChange={e => setFormMeriendas(e.target.value)}
                    placeholder="Cantidad de meriendas"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Puedes dejarlo en blanco y completarlo más tarde</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    value={formObservaciones}
                    onChange={e => setFormObservaciones(e.target.value)}
                    rows={3}
                    placeholder="Notas adicionales..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-gray-100">
                <button
                  onClick={() => setShowMenuModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarMenu}
                  disabled={savingMenu || !formTitulo.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {savingMenu ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingMenu ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
