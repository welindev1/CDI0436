'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StatCard from '@/components/dashboard/StatCard';
import { Users, BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    totalBeneficiarios: 0,
    totalClases: 0,
    asistenciaHoy: 0,
    promedioAsistencia: 0,
  });

  useEffect(() => {
    // Aquí harás las llamadas a la API
    // Por ahora, datos de ejemplo
    setStats({
      totalBeneficiarios: 156,
      totalClases: 12,
      asistenciaHoy: 142,
      promedioAsistencia: 91,
    });
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {usuario?.nombre}!
            </h1>
            <p className="text-gray-600 mt-1">
              Aquí tienes un resumen de la actividad del día
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Beneficiarios"
              value={stats.totalBeneficiarios}
              icon={Users}
              color="blue"
              trend={{ value: '+12%', isPositive: true }}
            />
            
            <StatCard
              title="Clases Activas"
              value={stats.totalClases}
              icon={BookOpen}
              color="green"
            />
            
            <StatCard
              title="Asistencia Hoy"
              value={stats.asistenciaHoy}
              icon={ClipboardCheck}
              color="purple"
              trend={{ value: '+5%', isPositive: true }}
            />
            
            <StatCard
              title="Promedio Asistencia"
              value={`${stats.promedioAsistencia}%`}
              icon={TrendingUp}
              color="yellow"
              trend={{ value: '+2%', isPositive: true }}
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próximas Clases */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Próximas Clases
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Matemáticas Básicas</p>
                      <p className="text-sm text-gray-500">Juan Pérez • 14:00 - 16:00</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      Hoy
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asistencias Recientes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actividad Reciente
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 border-l-4 border-green-500 bg-gray-50 rounded-r-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Asistencia registrada</p>
                      <p className="text-sm text-gray-500">Clase: Inglés Intermedio</p>
                    </div>
                    <span className="text-xs text-gray-400">Hace 5 min</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group">
                <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-500" />
                <p className="font-medium text-gray-700 group-hover:text-blue-600">Tomar Asistencia</p>
              </button>
              
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center group">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-green-500" />
                <p className="font-medium text-gray-700 group-hover:text-green-600">Nuevo Beneficiario</p>
              </button>
              
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center group">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-purple-500" />
                <p className="font-medium text-gray-700 group-hover:text-purple-600">Nueva Clase</p>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}