'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import {
  Cake,
  Calendar,
  User,
  Phone,
  Gift,
  PartyPopper
} from 'lucide-react';

interface CumpleanosItem {
  id: string;
  codigo: string;
  nombre: string;
  dia: number;
  fecha_nacimiento: string;
  edad: number;
  telefono: string | null;
  padre_tutor: string | null;
}

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
  const [cumpleanos, setCumpleanos] = useState<CumpleanosItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarCumpleanos = async (mes: number) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await beneficiariosApi.getCumpleanosPorMes(mes);
      setCumpleanos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cumpleaños');
      setCumpleanos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCumpleanos(mesSeleccionado);
  }, [mesSeleccionado]);

  const mesActual = new Date().getMonth() + 1;
  const diaActual = new Date().getDate();

  const getNombreMes = (mes: number) => {
    return meses.find(m => m.value === mes)?.label || '';
  };

  const esCumpleanosHoy = (dia: number) => {
    return mesSeleccionado === mesActual && dia === diaActual;
  };

  const esCumpleanosPasado = (dia: number) => {
    if (mesSeleccionado < mesActual) return true;
    if (mesSeleccionado === mesActual && dia < diaActual) return true;
    return false;
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
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Selector de Mes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <label className="font-medium text-gray-900">Selecciona un mes:</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {meses.map((mes) => (
                  <button
                    key={mes.value}
                    onClick={() => setMesSeleccionado(mes.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      mesSeleccionado === mes.value
                        ? 'bg-pink-500 text-white'
                        : mes.value === mesActual
                        ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mes.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando cumpleaños...</p>
              </div>
            ) : cumpleanos.length === 0 ? (
              <div className="p-8 text-center">
                <Cake className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay cumpleaños en {getNombreMes(mesSeleccionado)}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Día
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Beneficiario
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Código
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Edad Actual
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Cumple
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Padre/Tutor
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Teléfono
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cumpleanos.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 ${
                          esCumpleanosHoy(item.dia)
                            ? 'bg-gradient-to-r from-pink-50 to-purple-50'
                            : esCumpleanosPasado(item.dia)
                            ? 'opacity-60'
                            : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            esCumpleanosHoy(item.dia)
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                              : 'bg-pink-100 text-pink-600'
                          }`}>
                            {item.dia}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.nombre}</p>
                              {esCumpleanosHoy(item.dia) && (
                                <span className="inline-flex items-center gap-1 text-xs text-pink-600 font-medium">
                                  <Gift className="w-3 h-3" />
                                  ¡Hoy cumple años!
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.codigo}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                            {item.edad} años
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                            {item.edad + 1} años
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.padre_tutor || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {item.telefono ? (
                            <span className="flex items-center gap-1 text-gray-600">
                              <Phone className="w-4 h-4" />
                              {item.telefono}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

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
