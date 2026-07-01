'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import AgregarBeneficiariosSupervivenciaModal from '@/components/supervivencia/AgregarBeneficiariosSupervivenciaModal';
import SupervivenciaInfo from '@/components/supervivencia/SupervivenciaInfo';
import SupervivenciaStats from '@/components/supervivencia/SupervivenciaStats';
import SupervivenciaBeneficiarios from '@/components/supervivencia/SupervivenciaBeneficiarios';
import SupervivenciaAsistencia from '@/components/supervivencia/SupervivenciaAsistencia';
import { useAuth } from '@/contexts/AuthContext';
import { useSupervivencia, useFechasConAsistencia, useAsistenciasSupervivencia, useAgregarBeneficiariosSupervivencia } from '@/lib/hooks/useSupervivencias';
import { TabType } from '@/lib/types';
import { ArrowLeft, UserPlus, Users, ClipboardCheck, Shield, Clock } from 'lucide-react';

export default function SupervivenciaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const supervivenciaId = params.id as string;
  const { tienePermiso } = useAuth();
  const puedeEditar = tienePermiso('supervivencia:editar');

  const [activeTab, setActiveTab] = useState<TabType>('beneficiarios');
  const [showAgregarModal, setShowAgregarModal] = useState(false);

  // Queries
  const { data: supervivencia, isLoading, error } = useSupervivencia(supervivenciaId);
  const { data: fechasConAsistencia = [] } = useFechasConAsistencia(supervivenciaId);

  // Today's attendance for the stats card
  const today = new Date().toISOString().split('T')[0];
  const { data: todayAsistencia } = useAsistenciasSupervivencia(supervivenciaId, today);

  // Mutations
  const agregarMutation = useAgregarBeneficiariosSupervivencia();

  const handleAgregarBeneficiarios = async (beneficiarioIds: string[]) => {
    await agregarMutation.mutateAsync({ id: supervivenciaId, beneficiarioIds });
    setShowAgregarModal(false);
  };

  const queryError = error
    ? error instanceof Error
      ? error.message
      : 'Error al cargar el curso'
    : '';

  return (
    <ProtectedRoute requiredPermisos={['supervivencia:ver']}>
      <DashboardLayout>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : !supervivencia ? (
          <Alert variant="error">Curso de supervivencia no encontrado</Alert>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.push('/dashboard/supervivencia')}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-orange-600" />
                    {supervivencia.nombre}
                  </h1>
                  {supervivencia.codigo && (
                    <p className="text-gray-600 mt-1">Código: {supervivencia.codigo}</p>
                  )}
                </div>
              </div>
              {puedeEditar && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button onClick={() => setShowAgregarModal(true)} className="justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Agregar Beneficiarios
                  </Button>
                </div>
              )}
            </div>

            {queryError && <Alert variant="error">{queryError}</Alert>}

            {/* Info del curso — 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SupervivenciaInfo supervivencia={supervivencia} />
              <SupervivenciaStats supervivencia={supervivencia} />

              {/* Asistencia de Hoy */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  Asistencia de Hoy
                </h2>

                {todayAsistencia ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-900">Presentes</span>
                      <span className="text-2xl font-bold text-green-600">
                        {todayAsistencia.estadisticas.presentes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-900">Ausentes</span>
                      <span className="text-2xl font-bold text-red-600">
                        {todayAsistencia.estadisticas.ausentes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Sin Registrar</span>
                      <span className="text-2xl font-bold text-gray-600">
                        {todayAsistencia.estadisticas.sinRegistrar}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Ve al tab de Asistencia para registrar
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('beneficiarios')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'beneficiarios'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Beneficiarios ({supervivencia.beneficiarios?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('asistencia')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'asistencia'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 inline mr-2" />
                  Pasar Asistencia
                </button>
              </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'beneficiarios' && (
              <SupervivenciaBeneficiarios
                supervivencia={supervivencia}
                puedeEditar={puedeEditar}
                onAgregarClick={() => setShowAgregarModal(true)}
              />
            )}

            {activeTab === 'asistencia' && (
              <SupervivenciaAsistencia
                supervivenciaId={supervivenciaId}
                supervivencia={supervivencia}
                fechasConAsistencia={fechasConAsistencia}
              />
            )}

            {/* Modal Agregar Beneficiarios */}
            <AgregarBeneficiariosSupervivenciaModal
              isOpen={showAgregarModal}
              onClose={() => setShowAgregarModal(false)}
              onAgregar={handleAgregarBeneficiarios}
              beneficiariosActuales={supervivencia?.beneficiarios?.map((b) => b.id) || []}
            />
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
