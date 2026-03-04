'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import AgregarBeneficiariosSupervivenciaModal from '@/components/supervivencia/AgregarBeneficiariosSupervivenciaModal';
import { supervivenciasApi } from '@/lib/api/supervivencias';
import { useAuth } from '@/contexts/AuthContext';
import { Supervivencia } from '@/lib/types';
import {
  ArrowLeft,
  Edit,
  UserPlus,
  Users,
  Trash2,
  Shield
} from 'lucide-react';

export default function SupervivenciaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const supervivenciaId = params.id as string;
  const { tienePermiso } = useAuth();

  const [supervivencia, setSupervivencia] = useState<Supervivencia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState<string | null>(null);

  // Verificar permisos para editar
  const puedeEditar = tienePermiso('supervivencia:editar');

  useEffect(() => {
    loadSupervivencia();
  }, [supervivenciaId]);

  const loadSupervivencia = async () => {
    try {
      setIsLoading(true);
      const data = await supervivenciasApi.getById(supervivenciaId);
      setSupervivencia(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgregarBeneficiarios = async (beneficiarioIds: string[]) => {
    try {
      await supervivenciasApi.agregarBeneficiarios(supervivenciaId, beneficiarioIds);
      setShowAgregarModal(false);
      loadSupervivencia();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al agregar beneficiarios');
    }
  };

  const handleRemoverBeneficiarioClick = (beneficiarioId: string) => {
    setBeneficiarioToDelete(beneficiarioId);
    setShowDeleteConfirm(true);
  };

  const handleRemoverBeneficiario = async () => {
    if (!beneficiarioToDelete) return;

    try {
      await supervivenciasApi.removerBeneficiario(supervivenciaId, beneficiarioToDelete);
      setShowDeleteConfirm(false);
      setBeneficiarioToDelete(null);
      loadSupervivencia();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al remover beneficiario');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!supervivencia) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Alert variant="error">
            Curso de supervivencia no encontrado
          </Alert>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermisos={['supervivencia:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/supervivencia')}
              >
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

          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {/* Info del curso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información general */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                Información General
              </h2>

              <div className="space-y-3">
                {supervivencia.descripcion && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Descripción</p>
                    <p className="text-gray-600">{supervivencia.descripcion}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4" />
                    Capacidad
                  </p>
                  <p className="text-gray-600">
                    {supervivencia.beneficiarios?.length || 0}
                    {supervivencia.capacidad_maxima > 0 && ` / ${supervivencia.capacidad_maxima}`} inscrito(s)
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Estado</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    supervivencia.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {supervivencia.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-900">Total Inscritos</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {supervivencia.beneficiarios?.length || 0}
                  </span>
                </div>

                {supervivencia.capacidad_maxima > 0 && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-900">Cupos Disponibles</span>
                      <span className="text-2xl font-bold text-green-600">
                        {supervivencia.capacidad_maxima - (supervivencia.beneficiarios?.length || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-900">% Ocupación</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {Math.round(((supervivencia.beneficiarios?.length || 0) / supervivencia.capacidad_maxima) * 100)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Lista de beneficiarios */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Beneficiarios Inscritos ({supervivencia.beneficiarios?.length || 0})
              </h2>
            </div>

            {supervivencia.beneficiarios && supervivencia.beneficiarios.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {supervivencia.beneficiarios.map((beneficiario) => (
                  <div key={beneficiario.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-medium">
                          {beneficiario.nombre.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {beneficiario.nombre} {beneficiario.apellido}
                        </p>
                        <p className="text-sm text-gray-500">
                          Código: {beneficiario.codigo}
                          {beneficiario.fecha_nacimiento && (() => {
                            const nac = new Date(beneficiario.fecha_nacimiento);
                            const hoy = new Date();
                            let edad = hoy.getFullYear() - nac.getFullYear();
                            if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
                            return ` • ${edad} años`;
                          })()}
                        </p>
                      </div>
                    </div>
                    {puedeEditar && (
                      <button
                        onClick={() => handleRemoverBeneficiarioClick(beneficiario.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Remover del curso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hay beneficiarios inscritos en este curso</p>
                {puedeEditar && (
                  <Button onClick={() => setShowAgregarModal(true)}>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Agregar Beneficiarios
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Agregar Beneficiarios */}
        <AgregarBeneficiariosSupervivenciaModal
          isOpen={showAgregarModal}
          onClose={() => setShowAgregarModal(false)}
          onAgregar={handleAgregarBeneficiarios}
          beneficiariosActuales={supervivencia.beneficiarios?.map(b => b.id) || []}
        />

        {/* Modal Confirmar Eliminación */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirmar Remoción"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas remover este beneficiario del curso?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleRemoverBeneficiario}
              >
                Remover
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
