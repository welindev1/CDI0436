'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import AgregarBeneficiariosModal from '@/components/clases/AgregarBeneficiariosModal';
import { clasesApi } from '@/lib/api/clases';
import { Clase } from '@/lib/types';
import { 
  ArrowLeft, 
  Edit, 
  UserPlus,
  Users,
  Calendar,
  Clock,
  UserCircle,
  Trash2,
  BookOpen
} from 'lucide-react';

export default function ClaseDetallePage() {
  const params = useParams();
  const router = useRouter();
  const claseId = params.id as string;

  const [clase, setClase] = useState<Clase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadClase();
  }, [claseId]);

  const loadClase = async () => {
    try {
      setIsLoading(true);
      const data = await clasesApi.getById(claseId);
      setClase(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clase');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgregarBeneficiarios = async (beneficiarioIds: string[]) => {
    try {
      await clasesApi.agregarBeneficiarios(claseId, beneficiarioIds);
      setShowAgregarModal(false);
      loadClase();
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
      await clasesApi.removerBeneficiario(claseId, beneficiarioToDelete);
      setShowDeleteConfirm(false);
      setBeneficiarioToDelete(null);
      loadClase();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al remover beneficiario');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!clase) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Alert variant="error">
            Clase no encontrada
          </Alert>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermisos={['clases:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/clases')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clase.nombre}</h1>
                {clase.codigo && (
                  <p className="text-gray-600 mt-1">Código: {clase.codigo}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/clases/${claseId}/editar`)}
                className="justify-center"
              >
                <Edit className="w-5 h-5 mr-2" />
                Editar
              </Button>
              <Button onClick={() => setShowAgregarModal(true)} className="justify-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Agregar Beneficiarios
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {/* Info de la clase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información general */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Información General
              </h2>
              
              <div className="space-y-3">
                {clase.descripcion && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Descripción</p>
                    <p className="text-gray-600">{clase.descripcion}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                    <UserCircle className="w-4 h-4" />
                    Tutor
                  </p>
                  <p className="text-gray-600">
                    {clase.tutor?.nombre} {clase.tutor?.apellido}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    Horarios
                  </p>
                  <div className="space-y-1">
                    {clase.horarios?.map((h, idx) => (
                      <p key={idx} className="text-gray-600">
                        <span className="capitalize">{h.dia}</span> — {h.hora_inicio} - {h.hora_fin}
                      </p>
                    ))}
                    {(!clase.horarios || clase.horarios.length === 0) && (
                      <p className="text-gray-400 italic">Sin horarios asignados</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4" />
                    Capacidad
                  </p>
                  <p className="text-gray-600">
                    {clase.beneficiarios?.length || 0} 
                    {clase.capacidad_maxima > 0 && ` / ${clase.capacidad_maxima}`} inscrito(s)
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Estado</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    clase.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {clase.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Total Inscritos</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {clase.beneficiarios?.length || 0}
                  </span>
                </div>

                {clase.capacidad_maxima > 0 && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-900">Cupos Disponibles</span>
                      <span className="text-2xl font-bold text-green-600">
                        {clase.capacidad_maxima - (clase.beneficiarios?.length || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-900">% Ocupación</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {Math.round(((clase.beneficiarios?.length || 0) / clase.capacidad_maxima) * 100)}%
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
                Beneficiarios Inscritos ({clase.beneficiarios?.length || 0})
              </h2>
            </div>

            {clase.beneficiarios && clase.beneficiarios.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {clase.beneficiarios.map((beneficiario) => (
                  <div key={beneficiario.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
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
                    <button
                      onClick={() => handleRemoverBeneficiarioClick(beneficiario.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remover de la clase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hay beneficiarios inscritos en esta clase</p>
                <Button onClick={() => setShowAgregarModal(true)}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Agregar Beneficiarios
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Agregar Beneficiarios */}
        <AgregarBeneficiariosModal
          isOpen={showAgregarModal}
          onClose={() => setShowAgregarModal(false)}
          onAgregar={handleAgregarBeneficiarios}
          beneficiariosActuales={clase.beneficiarios?.map(b => b.id) || []}
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
              ¿Estás seguro de que deseas remover este beneficiario de la clase?
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