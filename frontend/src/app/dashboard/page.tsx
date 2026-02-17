'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Users, BookOpen, ClipboardCheck, TrendingUp, Calendar, Clock, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { clasesApi } from '@/lib/api/clases';
import { Beneficiario, Clase } from '@/lib/types';

function calcularEdad(fechaNacimiento: string): number {
  const nac = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bens, cls] = await Promise.all([
          beneficiariosApi.getAll(),
          clasesApi.getAll(),
        ]);
        setBeneficiarios(bens);
        setClases(cls);
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalBeneficiarios = beneficiarios.length;
  const beneficiariosActivos = beneficiarios.filter(b => b.activo).length;
  const beneficiariosInactivos = totalBeneficiarios - beneficiariosActivos;
  const totalClases = clases.length;
  const clasesActivas = clases.filter(c => c.activo).length;

  // Edad promedio
  const beneficiariosConFecha = beneficiarios.filter(b => b.fecha_nacimiento);
  const edadPromedio = beneficiariosConFecha.length > 0
    ? Math.round(beneficiariosConFecha.reduce((acc, b) => acc + calcularEdad(b.fecha_nacimiento!), 0) / beneficiariosConFecha.length)
    : 0;

  // Últimos beneficiarios registrados
  const ultimosBeneficiarios = [...beneficiarios]
    .sort((a, b) => new Date(b.creado_en || '').getTime() - new Date(a.creado_en || '').getTime())
    .slice(0, 5);

  // Saludo dinámico
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  // Fecha actual
  const fechaHoy = new Date().toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-500 text-sm">Cargando dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">
                    {saludo}, {usuario?.nombre} 👋
                  </h1>
                  <p className="text-blue-100 mt-1 text-sm md:text-base">
                    Panel de control del CDI
                  </p>
                </div>
                <div className="flex items-center gap-2 text-blue-200 text-sm bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm w-fit">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">{fechaHoy}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Total Beneficiarios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalBeneficiarios}</p>
              <p className="text-sm text-gray-500 mt-0.5">Beneficiarios</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  {beneficiariosActivos} activos
                </span>
                {beneficiariosInactivos > 0 && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {beneficiariosInactivos} inactivos
                  </span>
                )}
              </div>
            </div>

            {/* Total Clases */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalClases}</p>
              <p className="text-sm text-gray-500 mt-0.5">Clases</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {clasesActivas} activas
                </span>
              </div>
            </div>

            {/* Edad Promedio */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{edadPromedio}</p>
              <p className="text-sm text-gray-500 mt-0.5">Edad Promedio</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  {beneficiariosConFecha.length} con fecha
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {Math.round((beneficiariosActivos / (totalBeneficiarios || 1)) * 100)}%
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Tasa Activos</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  del total
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimos Beneficiarios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Últimos Beneficiarios
                </h2>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Recientes</span>
              </div>
              {ultimosBeneficiarios.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay beneficiarios registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ultimosBeneficiarios.map((ben) => (
                    <div key={ben.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {ben.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {ben.nombre} {ben.apellido || ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ben.codigo}
                          {ben.fecha_nacimiento && ` • ${calcularEdad(ben.fecha_nacimiento)} años`}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${ben.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ben.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clases */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Clases Registradas
                </h2>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{clasesActivas} activas</span>
              </div>
              {clases.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay clases registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clases.slice(0, 5).map((clase) => (
                    <div key={clase.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {clase.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {clase.codigo || 'Sin código'}
                          {clase.beneficiarios && ` • ${clase.beneficiarios.length} beneficiarios`}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${clase.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                        {clase.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  ))}
                  {clases.length > 5 && (
                    <p className="text-xs text-center text-gray-400 pt-1">
                      y {clases.length - 5} clases más...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}