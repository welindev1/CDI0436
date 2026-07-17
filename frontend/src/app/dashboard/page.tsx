'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Users, BookOpen, ClipboardCheck, TrendingUp, Calendar, Loader2, Gift, HeartHandshake, Camera, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { clasesApi } from '@/lib/api/clases';
import { ayudasApi, Ayuda } from '@/lib/api/ayudas';
import { bonosRegalosApi, BonoRegalo } from '@/lib/api/bonos';
import { Beneficiario, Clase } from '@/lib/types';
import { calcularEdad } from '@/lib/utils/formatters';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [bonosPendientes, setBonosPendientes] = useState<BonoRegalo[]>([]);
  const [ayudasPendientes, setAyudasPendientes] = useState<Ayuda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bens, cls, bonos, ayudas] = await Promise.all([
          beneficiariosApi.getAll(),
          clasesApi.getAll(),
          bonosRegalosApi.getAll({ entregado: false }),
          ayudasApi.findAll(),
        ]);
        setBeneficiarios(bens);
        setClases(cls);
        setBonosPendientes(bonos);
        setAyudasPendientes(ayudas.filter(a => a.estado === 'pendiente'));
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
    ? Math.round(beneficiariosConFecha.reduce((acc, b) => acc + (calcularEdad(b.fecha_nacimiento!) ?? 0), 0) / beneficiariosConFecha.length)
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-500 text-sm">Cargando dashboard...</p>
            </div>
          </div>
        ) : (
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

          {/* Bottom Grid - Acceso Rápido */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bonos Pendientes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Bonos Pendientes</h2>
                </div>
                <button
                  onClick={() => router.push('/dashboard/bonos/lista')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  Ver todos <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {bonosPendientes.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay bonos pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bonosPendientes.slice(0, 5).map((bono) => (
                    <div
                      key={bono.id}
                      onClick={() => router.push('/dashboard/bonos/lista')}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors cursor-pointer group"
                    >
                      <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold flex-shrink-0">
                        {bono.beneficiario_nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {bono.beneficiario_nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bono.codigo} • RD${bono.monto.toLocaleString('es-DO')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Camera className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                  {bonosPendientes.length > 5 && (
                    <p className="text-xs text-center text-gray-400 pt-1">
                      y {bonosPendientes.length - 5} bonos más...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Ayudas Pendientes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Ayudas Pendientes</h2>
                </div>
                <button
                  onClick={() => router.push('/dashboard/ayudas')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  Ver todas <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {ayudasPendientes.length === 0 ? (
                <div className="text-center py-8">
                  <HeartHandshake className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay ayudas pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ayudasPendientes.slice(0, 5).map((ayuda) => (
                    <div
                      key={ayuda.id}
                      onClick={() => router.push('/dashboard/ayudas')}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer group"
                    >
                      <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold flex-shrink-0">
                        {ayuda.nombre_beneficiario.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {ayuda.nombre_beneficiario}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ayuda.tipo.replace('_', ' ')} • {ayuda.nombre_madre || ayuda.nombre_tutor || 'Sin contacto'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                  {ayudasPendientes.length > 5 && (
                    <p className="text-xs text-center text-gray-400 pt-1">
                      y {ayudasPendientes.length - 5} ayudas más...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}