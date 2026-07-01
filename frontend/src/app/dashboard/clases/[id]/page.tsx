'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import ClaseInfo from '@/components/clases/ClaseInfo';
import ClaseAsistencias from '@/components/clases/ClaseAsistencias';
import ClaseBeneficiarios from '@/components/clases/ClaseBeneficiarios';
import { clasesApi } from '@/lib/api/clases';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft, Edit, UserPlus, Users, ClipboardCheck, Info,
} from 'lucide-react';
import type { Clase } from '@/lib/types';

type ActiveTab = 'estudiantes' | 'asistencia' | 'info';

export default function ClaseDetallePage() {
  const params = useParams();
  const router = useRouter();
  const claseId = params.id as string;
  const { tienePermiso } = useAuth();

  const [clase, setClase] = useState<Clase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('estudiantes');

  const puedeEditar = tienePermiso('clases:editar');

  const loadClase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await clasesApi.getById(claseId);
      setClase(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : 'Error al cargar la clase';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [claseId]);

  useEffect(() => {
    loadClase();
  }, [loadClase]);

  const handleAgregarBeneficiarios = async (beneficiarioIds: string[]) => {
    try {
      await clasesApi.agregarBeneficiarios(claseId, beneficiarioIds);
      setShowAgregarModal(false);
      loadClase();
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al agregar beneficiarios';
      throw new Error(msg);
    }
  };

  const handleRemoverBeneficiario = async (beneficiarioId: string) => {
    try {
      await clasesApi.removerBeneficiario(claseId, beneficiarioId);
      loadClase();
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al remover beneficiario';
      setError(msg);
    }
  };

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      key: 'estudiantes',
      label: `Estudiantes (${clase?.beneficiarios?.length || 0})`,
      icon: <Users className="w-4 h-4" />,
    },
    { key: 'asistencia', label: 'Asistencia', icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: 'info', label: 'Información de la Clase', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <ProtectedRoute requiredPermisos={['clases:ver']}>
      <DashboardLayout>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : error && !clase ? (
          <div className="space-y-4 py-8 max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Info className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No se pudo cargar la clase</h2>
            <p className="text-gray-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
            <Button variant="outline" onClick={() => router.push('/dashboard/clases')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a clases
            </Button>
          </div>
        ) : !clase ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.push('/dashboard/clases')}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{clase.nombre}</h1>
                  {clase.codigo && <p className="text-gray-600 mt-1">Código: {clase.codigo}</p>}
                </div>
              </div>
              {puedeEditar && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/clases/${claseId}/editar`)}
                    className="justify-center"
                  >
                    <Edit className="w-5 h-5 mr-2" /> Editar
                  </Button>
                  <Button onClick={() => setShowAgregarModal(true)} className="justify-center">
                    <UserPlus className="w-5 h-5 mr-2" /> Agregar Beneficiarios
                  </Button>
                </div>
              )}
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 gap-6 mt-4">
              {tabs.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`pb-4 text-sm font-medium transition-colors relative ${
                    activeTab === key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {icon}
                    {label}
                  </div>
                  {activeTab === key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'estudiantes' && (
              <ClaseBeneficiarios
                beneficiarios={clase.beneficiarios}
                puedeEditar={puedeEditar}
                onAgregarBeneficiarios={handleAgregarBeneficiarios}
                onRemoverBeneficiario={handleRemoverBeneficiario}
                showAgregarModal={showAgregarModal}
                onToggleAgregarModal={setShowAgregarModal}
              />
            )}

            {activeTab === 'asistencia' && (
              <ClaseAsistencias clase={clase} claseId={claseId} />
            )}

            {activeTab === 'info' && (
              <ClaseInfo clase={clase} />
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
