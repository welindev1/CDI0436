'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import EstadoBadge from './EstadoBadge';
import { asistenciasApi } from '@/lib/api/asistencias';
import { clasesApi } from '@/lib/api/clases';
import { EstadoAsistencia, Clase, Beneficiario } from '@/lib/types';
import { Save, CheckCircle, XCircle, Clock, AlertCircle, Users, Search, MessageSquare } from 'lucide-react';

interface RegistroAsistenciaProps {
  claseId: string;
  fecha: string;
  onSaved?: () => void;
}

export default function RegistroAsistencia({ claseId, fecha, onSaved }: RegistroAsistenciaProps) {
  const [clase, setClase] = useState<Clase | null>(null);
  const [asistencias, setAsistencias] = useState<Map<string, {
    estado: EstadoAsistencia;
    observaciones: string;
  }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClaseYAsistencias();
  }, [claseId, fecha]);

  const loadClaseYAsistencias = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Cargar clase con beneficiarios
      const claseData = await clasesApi.getById(claseId);
      setClase(claseData);

      // Cargar asistencias existentes
      const asistenciasExistentes = await asistenciasApi.getByClaseYFecha(claseId, fecha);

      // Mapear SOLO las asistencias que ya existen en BD
      // Los beneficiarios sin registro NO se inicializan (quedan fuera del mapa)
      const map = new Map();
      asistenciasExistentes.forEach(a => {
        map.set(a.beneficiario.id, {
          estado: a.estado,
          observaciones: a.observaciones || ''
        });
      });

      setAsistencias(map);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEstadoChange = (beneficiarioId: string, estado: EstadoAsistencia) => {
    setAsistencias(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(beneficiarioId) || { estado: EstadoAsistencia.AUSENTE, observaciones: '' };
      newMap.set(beneficiarioId, { ...current, estado });
      return newMap;
    });
  };

  const handleObservacionesChange = (beneficiarioId: string, observaciones: string) => {
    setAsistencias(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(beneficiarioId) || { estado: EstadoAsistencia.AUSENTE, observaciones: '' };
      newMap.set(beneficiarioId, { ...current, observaciones });
      return newMap;
    });
  };

  const handleMarcarTodos = async (estado: EstadoAsistencia) => {
    if (!confirm(`¿Marcar a todos como ${estado}?`)) return;

    try {
      setIsSaving(true);
      setError('');
      await asistenciasApi.marcarTodos({
        claseId,
        fecha,
        estado
      });
      setSuccess(`Todos marcados como ${estado}`);
      loadClaseYAsistencias();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al marcar asistencias');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGuardar = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      // Solo guardar los beneficiarios que tienen un estado seleccionado
      const asistenciasArray = Array.from(asistencias.entries()).map(([beneficiarioId, data]) => ({
        beneficiarioId,
        estado: data.estado,
        observaciones: data.observaciones || undefined
      }));

      if (asistenciasArray.length === 0) {
        setError('Debes marcar al menos un beneficiario antes de guardar');
        setIsSaving(false);
        return;
      }

      await asistenciasApi.registrarAsistenciaMasiva({
        claseId,
        fecha,
        asistencias: asistenciasArray
      });

      setSuccess('Asistencias guardadas correctamente');
      if (onSaved) onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar asistencias');
    } finally {
      setIsSaving(false);
    }
  };

  const getEstadisticas = () => {
    const stats = {
      total: clase?.beneficiarios?.length || 0,
      sinMarcar: 0,
      presentes: 0,
      ausentes: 0,
      justificados: 0,
      tardes: 0
    };

    stats.sinMarcar = stats.total - asistencias.size;

    asistencias.forEach(({ estado }) => {
      if (estado === EstadoAsistencia.PRESENTE) stats.presentes++;
      else if (estado === EstadoAsistencia.AUSENTE) stats.ausentes++;
      else if (estado === EstadoAsistencia.JUSTIFICADO) stats.justificados++;
      else if (estado === EstadoAsistencia.TARDE) stats.tardes++;
    });

    return stats;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clase) {
    return (
      <Alert variant="error">
        No se pudo cargar la clase
      </Alert>
    );
  }

  const stats = getEstadisticas();

  return (
    <div className="space-y-6">
      {/* Header con info de la clase */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{clase.nombre}</h2>
            {clase.codigo && (
              <p className="text-sm text-gray-500 mt-1">Código: {clase.codigo}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span>Tutor: {clase.tutor?.nombre} {clase.tutor?.apellido}</span>
              <span>•</span>
              <span>Fecha: {new Date(fecha).toLocaleDateString('es-DO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Sin Marcar</p>
              <p className="text-2xl font-bold text-gray-600">{stats.sinMarcar}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Presentes</p>
              <p className="text-2xl font-bold text-green-700">{stats.presentes}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Ausentes</p>
              <p className="text-2xl font-bold text-red-700">{stats.ausentes}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Tardes</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.tardes}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Justificados</p>
              <p className="text-2xl font-bold text-blue-700">{stats.justificados}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarcarTodos(EstadoAsistencia.PRESENTE)}
            disabled={isSaving}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar Todos Presentes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarcarTodos(EstadoAsistencia.AUSENTE)}
            disabled={isSaving}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Marcar Todos Ausentes
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      {/* Lista de beneficiarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Buscador */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar beneficiario por nombre, apellido o código..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clase.beneficiarios?.filter((b) => {
                if (!searchTerm.trim()) return true;
                const term = searchTerm.toLowerCase();
                return (
                  b.nombre?.toLowerCase().includes(term) ||
                  b.apellido?.toLowerCase().includes(term) ||
                  b.codigo?.toLowerCase().includes(term) ||
                  `${b.nombre} ${b.apellido}`.toLowerCase().includes(term)
                );
              }).map((beneficiario, index) => {
                const asistencia = asistencias.get(beneficiario.id);
                const estadoActual = asistencia?.estado ?? null;

                return (
                  <tr key={beneficiario.id} className={`hover:bg-gray-50 ${estadoActual === null ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {beneficiario.nombre} {beneficiario.apellido}
                        </p>
                        <p className="text-sm text-gray-500">
                          {beneficiario.codigo}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 items-center">
                        {estadoActual === null && (
                          <span className="text-xs text-amber-600 font-medium mr-1">Sin marcar</span>
                        )}
                        <button
                          onClick={() => handleEstadoChange(beneficiario.id, EstadoAsistencia.PRESENTE)}
                          className={`p-2 rounded-lg transition-colors ${
                            estadoActual === EstadoAsistencia.PRESENTE
                              ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                              : 'bg-gray-100 text-gray-500 hover:bg-green-50'
                          }`}
                          title="Presente"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEstadoChange(beneficiario.id, EstadoAsistencia.AUSENTE)}
                          className={`p-2 rounded-lg transition-colors ${
                            estadoActual === EstadoAsistencia.AUSENTE
                              ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                              : 'bg-gray-100 text-gray-500 hover:bg-red-50'
                          }`}
                          title="Ausente"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEstadoChange(beneficiario.id, EstadoAsistencia.TARDE)}
                          className={`p-2 rounded-lg transition-colors ${
                            estadoActual === EstadoAsistencia.TARDE
                              ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500'
                              : 'bg-gray-100 text-gray-500 hover:bg-yellow-50'
                          }`}
                          title="Tarde"
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEstadoChange(beneficiario.id, EstadoAsistencia.JUSTIFICADO)}
                          className={`p-2 rounded-lg transition-colors ${
                            estadoActual === EstadoAsistencia.JUSTIFICADO
                              ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                              : 'bg-gray-100 text-gray-500 hover:bg-blue-50'
                          }`}
                          title="Justificado"
                        >
                          <AlertCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={asistencia?.observaciones ?? ''}
                          onChange={(e) => handleObservacionesChange(beneficiario.id, e.target.value)}
                          placeholder="Observaciones..."
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {asistencia?.observaciones && asistencia.observaciones.length > 0 && (
                          <div className="relative group">
                            <button
                              type="button"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Ver observación completa"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <div className="absolute z-50 bottom-full right-0 mb-2 hidden group-hover:block">
                              <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 max-w-xs shadow-lg">
                                <p className="font-medium text-gray-300 text-xs mb-1">Observación:</p>
                                <p className="whitespace-pre-wrap break-words">{asistencia.observaciones}</p>
                              </div>
                              <div className="absolute bottom-0 right-4 translate-y-full">
                                <div className="border-8 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <Button
          onClick={handleGuardar}
          isLoading={isSaving}
          size="lg"
          className="min-w-[200px]"
        >
          <Save className="w-5 h-5 mr-2" />
          Guardar Asistencias
        </Button>
      </div>
    </div>
  );
}