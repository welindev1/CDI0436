'use client';

import { useState, useEffect, useCallback } from 'react';
import Alert from '@/components/ui/Alert';
import { asistenciasApi } from '@/lib/api/asistencias';
import { clasesApi } from '@/lib/api/clases';
import { EstadoAsistencia, Clase } from '@/lib/types';
import {
  Save, CheckCircle, XCircle, Users, Search,
  MessageSquare, X, Loader2, MinusCircle, RotateCcw
} from 'lucide-react';

interface RegistroAsistenciaProps {
  claseId: string;
  fecha: string;
  onSaved?: () => void;
}

const ESTADOS = [
  { valor: EstadoAsistencia.PRESENTE,   label: 'Presente',    icon: CheckCircle,  bg: 'bg-green-100',  text: 'text-green-700',  ring: 'ring-green-500',  dot: 'bg-green-500' },
  { valor: EstadoAsistencia.AUSENTE,    label: 'Ausente',     icon: XCircle,      bg: 'bg-red-100',    text: 'text-red-700',    ring: 'ring-red-500',    dot: 'bg-red-500' },
  { valor: null,                       label: 'Sin marcar',   icon: MinusCircle,   bg: 'bg-gray-100',   text: 'text-gray-600',   ring: 'ring-gray-400',  dot: 'bg-gray-400' },
];

export default function RegistroAsistencia({ claseId, fecha, onSaved }: RegistroAsistenciaProps) {
  const [clase, setClase] = useState<Clase | null>(null);
  const [asistencias, setAsistencias] = useState<Map<string, { estado: EstadoAsistencia | null; observaciones: string }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalObservacion, setModalObservacion] = useState<{ nombre: string; observacion: string } | null>(null);

  const loadClaseYAsistencias = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const claseData = await clasesApi.getById(claseId);
      setClase(claseData);
      const asistenciasExistentes = await asistenciasApi.getByClaseYFecha(claseId, fecha);
      const map = new Map<string, { estado: EstadoAsistencia | null; observaciones: string }>();
      asistenciasExistentes.forEach(a => {
        map.set(a.beneficiario.id, { estado: a.estado, observaciones: a.observaciones || '' });
      });
      setAsistencias(map);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }, [claseId, fecha]);

  useEffect(() => { loadClaseYAsistencias(); }, [loadClaseYAsistencias]);

  const handleEstadoChange = (beneficiarioId: string, estado: EstadoAsistencia | null) => {
    setAsistencias(prev => {
      const m = new Map(prev);
      if (estado === null) {
        m.delete(beneficiarioId);
      } else {
        const current = m.get(beneficiarioId) || { estado: null, observaciones: '' };
        m.set(beneficiarioId, { ...current, estado });
      }
      return m;
    });
  };

  const handleObservacionesChange = (beneficiarioId: string, observaciones: string) => {
    setAsistencias(prev => {
      const m = new Map(prev);
      const current = m.get(beneficiarioId) || { estado: null, observaciones: '' };
      m.set(beneficiarioId, { ...current, observaciones });
      return m;
    });
  };

  const handleMarcarTodos = async (estado: EstadoAsistencia) => {
    if (!confirm(`¿Marcar a todos como ${estado}?`)) return;
    try {
      setIsSaving(true);
      setError('');
      await asistenciasApi.marcarTodos({ claseId, fecha, estado });
      setSuccess(`Todos marcados como ${estado}`);
      loadClaseYAsistencias();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Error al marcar asistencias');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLimpiarTodos = () => {
    if (!confirm('¿Quitar todas las marcas de esta fecha?')) return;
    setAsistencias(new Map());
    setSuccess('Todas las marcas de esta fecha fueron quitadas');
  };

  const handleGuardar = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');
      const asistenciasArray = Array.from(asistencias.entries())
        .filter(([, data]) => data.estado !== null)
        .map(([beneficiarioId, data]) => ({
          beneficiarioId,
          estado: data.estado as EstadoAsistencia,
          observaciones: data.observaciones || undefined,
        }));

      await asistenciasApi.registrarAsistenciaMasiva({ claseId, fecha, asistencias: asistenciasArray });
      setSuccess(
        asistenciasArray.length === 0
          ? 'Se limpiaron todas las asistencias para esta fecha'
          : 'Asistencias guardadas correctamente'
      );
      if (onSaved) onSaved();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Error al guardar asistencias');
    } finally {
      setIsSaving(false);
    }
  };

  const getStats = () => {
    const total = clase?.beneficiarios?.length || 0;
    let presentes = 0, ausentes = 0;
    asistencias.forEach(({ estado }) => {
      if (estado === EstadoAsistencia.PRESENTE) presentes++;
      else if (estado === EstadoAsistencia.AUSENTE) ausentes++;
    });
    return { total, sinMarcar: total - asistencias.size, presentes, ausentes };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <p className="text-gray-500 text-sm">Cargando lista de asistencia...</p>
      </div>
    );
  }

  if (!clase) {
    return <Alert variant="error">No se pudo cargar la clase</Alert>;
  }

  const stats = getStats();

  const beneficiariosFiltrados = (clase.beneficiarios || []).filter(b => {
    if (!searchTerm.trim()) return true;
    const t = searchTerm.toLowerCase();
    return (
      b.nombre?.toLowerCase().includes(t) ||
      b.apellido?.toLowerCase().includes(t) ||
      b.codigo?.toLowerCase().includes(t) ||
      `${b.nombre} ${b.apellido}`.toLowerCase().includes(t)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header removido porque ahora está integrado en el perfil de la clase */}

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Sin marcar', value: stats.sinMarcar, bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',  icon: <Users className="w-5 h-5 text-gray-400" /> },
          { label: 'Presentes',  value: stats.presentes, bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
          { label: 'Ausentes',   value: stats.ausentes,  bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   icon: <XCircle className="w-5 h-5 text-red-500" /> },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3 flex items-center justify-between`}>
            <div>
              <p className="text-[11px] font-medium text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            </div>
            {s.icon}
          </div>
        ))}
      </div>

      {/* ── Acciones rápidas ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Marcar todos:</span>
        {ESTADOS.filter(e => e.valor !== null).map(e => {
          const Icon = e.icon;
          return (
            <button
              key={e.label}
              onClick={() => handleMarcarTodos(e.valor as EstadoAsistencia)}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border
                ${e.bg} ${e.text} border-transparent hover:ring-2 hover:${e.ring} disabled:opacity-50`}
            >
              <Icon className="w-3.5 h-3.5" />
              {e.label}
            </button>
          );
        })}
        <button
          onClick={handleLimpiarTodos}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Quitar todos
        </button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* ── Lista de beneficiarios ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Buscador */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar beneficiario por nombre, apellido o código..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Beneficiario</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {beneficiariosFiltrados.map((b, idx) => {
                const asistencia = asistencias.get(b.id);
                const estadoActual = asistencia?.estado ?? null;

                return (
                  <tr
                    key={b.id}
                    className={`transition-colors ${estadoActual === null ? 'bg-amber-50/40' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-5 py-3 text-sm text-gray-400 font-medium">{idx + 1}</td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {b.nombre?.charAt(0)}{b.apellido?.charAt(0) ?? ''}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {b.nombre} {b.apellido}
                          </p>
                          <p className="text-xs text-gray-400">{b.codigo}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {estadoActual === null && (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mr-1">
                            Sin marcar
                          </span>
                        )}
                        {ESTADOS.map(e => {
                          const Icon = e.icon;
                          const activo = estadoActual === e.valor;
                          return (
                            <button
                              key={e.valor}
                              onClick={() => handleEstadoChange(b.id, e.valor)}
                              title={e.label}
                              className={`p-2 rounded-lg transition-all
                                ${activo
                                  ? `${e.bg} ${e.text} ring-2 ${e.ring} shadow-sm`
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={asistencia?.observaciones ?? ''}
                          onChange={e => handleObservacionesChange(b.id, e.target.value)}
                          placeholder="Observaciones..."
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        />
                        {asistencia?.observaciones && asistencia.observaciones.length > 0 && (
                          <button
                            onClick={() => setModalObservacion({ nombre: `${b.nombre} ${b.apellido}`, observacion: asistencia.observaciones })}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {beneficiariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No se encontraron beneficiarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Botón guardar ─────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Guardando...' : 'Guardar Asistencias'}
        </button>
      </div>

      {/* ── Modal de observación ──────────────────────────────── */}
      {modalObservacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Observación</h3>
                <p className="text-xs text-gray-400">{modalObservacion.nombre}</p>
              </div>
              <button onClick={() => setModalObservacion(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                {modalObservacion.observacion}
              </p>
            </div>
            <div className="px-6 pb-5">
              <button
                onClick={() => setModalObservacion(null)}
                className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}