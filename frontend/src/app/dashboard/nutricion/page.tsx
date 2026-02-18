'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import { asistenciasApi } from '@/lib/api/asistencias';
import { UtensilsCrossed, Users, CheckCircle, Calendar } from 'lucide-react';

interface ResumenClase {
  claseId: string;
  nombre: string;
  codigo: string | null;
  tutor: string | null;
  totalInscritos: number;
  totalPresentes: number;
}

export default function NutricionPage() {
  const [fecha, setFecha] = useState('');
  const [resumen, setResumen] = useState<ResumenClase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);

  const handleBuscar = async () => {
    if (!fecha) {
      setError('Por favor selecciona una fecha');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const data = await asistenciasApi.getResumenPorFecha(fecha);
      setResumen(data);
      setBuscado(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el resumen');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPresentes = resumen.reduce((acc, c) => acc + c.totalPresentes, 0);
  const totalInscritos = resumen.reduce((acc, c) => acc + c.totalInscritos, 0);
  const clasesConAsistencia = resumen.filter(c => c.totalPresentes > 0).length;

  return (
    <ProtectedRoute requiredPermisos={['nutricion:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7 text-green-600" />
              Nutrición
            </h1>
            <p className="text-gray-600 mt-1">
              Resumen de beneficiarios presentes por clase en una fecha seleccionada
            </p>
          </div>

          {/* Selector de fecha */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Seleccionar Fecha
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de asistencia
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleBuscar}
                disabled={isLoading || !fecha}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Cargando...
                  </span>
                ) : (
                  'Ver Resumen'
                )}
              </button>
            </div>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          {/* Resultados */}
          {buscado && !isLoading && (
            <>
              {/* Estadísticas globales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Presentes</p>
                      <p className="text-3xl font-bold text-green-600">{totalPresentes}</p>
                      <p className="text-xs text-gray-400 mt-1">de {totalInscritos} inscritos</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Clases con Asistencia</p>
                      <p className="text-3xl font-bold text-blue-600">{clasesConAsistencia}</p>
                      <p className="text-xs text-gray-400 mt-1">de {resumen.length} clases activas</p>
                    </div>
                    <UtensilsCrossed className="w-10 h-10 text-blue-400" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Porcentaje Global</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {totalInscritos > 0
                          ? `${((totalPresentes / totalInscritos) * 100).toFixed(1)}%`
                          : '0%'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">asistencia del día</p>
                    </div>
                    <Users className="w-10 h-10 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Tabla por clase */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalle por Clase —{' '}
                    <span className="text-blue-600">
                      {new Date(fecha + 'T00:00:00').toLocaleDateString('es-DO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </h3>
                </div>

                {resumen.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay clases activas registradas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clase
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tutor
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Inscritos
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Presentes
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % Asistencia
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {resumen.map((clase) => {
                          const porcentaje = clase.totalInscritos > 0
                            ? ((clase.totalPresentes / clase.totalInscritos) * 100).toFixed(1)
                            : '0';
                          const pct = parseFloat(porcentaje);

                          return (
                            <tr key={clase.claseId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{clase.nombre}</p>
                                  {clase.codigo && (
                                    <p className="text-xs text-gray-500">{clase.codigo}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {clase.tutor || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {clase.totalInscritos}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                  clase.totalPresentes > 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {clase.totalPresentes}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all ${
                                        pct >= 80 ? 'bg-green-500' :
                                        pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-medium ${
                                    pct >= 80 ? 'text-green-700' :
                                    pct >= 50 ? 'text-yellow-700' : 'text-red-700'
                                  }`}>
                                    {porcentaje}%
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
            </>
          )}

          {!buscado && !isLoading && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Selecciona una fecha para ver el resumen de asistencia por clase
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
