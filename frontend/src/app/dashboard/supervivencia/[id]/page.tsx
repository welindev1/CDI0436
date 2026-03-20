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
import { Supervivencia, AsistenciaSupervivenciaResponse } from '@/lib/types';
import {
  ArrowLeft,
  Edit,
  UserPlus,
  Users,
  Trash2,
  Shield,
  User,
  Calendar,
  ClipboardCheck,
  Check,
  X,
  Clock,
  Save
} from 'lucide-react';

type TabType = 'beneficiarios' | 'asistencia';

interface AsistenciaLocal {
  beneficiario_id: string;
  presente: boolean;
  observaciones: string;
}

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

  // Tab de asistencia
  const [activeTab, setActiveTab] = useState<TabType>('beneficiarios');
  const [fechaAsistencia, setFechaAsistencia] = useState(new Date().toISOString().split('T')[0]);
  const [asistenciasData, setAsistenciasData] = useState<AsistenciaSupervivenciaResponse | null>(null);
  const [asistenciasLocales, setAsistenciasLocales] = useState<AsistenciaLocal[]>([]);
  const [loadingAsistencia, setLoadingAsistencia] = useState(false);
  const [savingAsistencia, setSavingAsistencia] = useState(false);
  const [fechasConAsistencia, setFechasConAsistencia] = useState<string[]>([]);

  // Verificar permisos para editar
  const puedeEditar = tienePermiso('supervivencia:editar');

  useEffect(() => {
    loadSupervivencia();
    loadFechasConAsistencia();
  }, [supervivenciaId]);

  useEffect(() => {
    if (activeTab === 'asistencia' && supervivencia) {
      loadAsistenciasPorFecha();
    }
  }, [activeTab, fechaAsistencia, supervivencia]);

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

  const loadFechasConAsistencia = async () => {
    try {
      const fechas = await supervivenciasApi.getFechasConAsistencia(supervivenciaId);
      setFechasConAsistencia(fechas);
    } catch (err) {
      console.error('Error al cargar fechas con asistencia:', err);
    }
  };

  const loadAsistenciasPorFecha = async () => {
    if (!supervivencia) return;

    try {
      setLoadingAsistencia(true);
      const data = await supervivenciasApi.getAsistenciasPorFecha(supervivenciaId, fechaAsistencia);
      setAsistenciasData(data);

      // Inicializar asistencias locales
      const locales: AsistenciaLocal[] = data.asistencias.map(a => ({
        beneficiario_id: a.beneficiario.id,
        presente: a.presente ?? false,
        observaciones: a.observaciones || ''
      }));
      setAsistenciasLocales(locales);
    } catch (err: any) {
      console.error('Error al cargar asistencias:', err);
    } finally {
      setLoadingAsistencia(false);
    }
  };

  const handleAsistenciaChange = (beneficiarioId: string, presente: boolean) => {
    setAsistenciasLocales(prev =>
      prev.map(a =>
        a.beneficiario_id === beneficiarioId ? { ...a, presente } : a
      )
    );
  };

  const handleObservacionChange = (beneficiarioId: string, observaciones: string) => {
    setAsistenciasLocales(prev =>
      prev.map(a =>
        a.beneficiario_id === beneficiarioId ? { ...a, observaciones } : a
      )
    );
  };

  const handleGuardarAsistencia = async () => {
    try {
      setSavingAsistencia(true);
      await supervivenciasApi.registrarAsistencia(supervivenciaId, {
        fecha: fechaAsistencia,
        asistencias: asistenciasLocales.map(a => ({
          beneficiario_id: a.beneficiario_id,
          presente: a.presente,
          observaciones: a.observaciones || undefined
        }))
      });
      await loadAsistenciasPorFecha();
      await loadFechasConAsistencia();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar asistencia');
    } finally {
      setSavingAsistencia(false);
    }
  };

  const marcarTodos = (presente: boolean) => {
    setAsistenciasLocales(prev =>
      prev.map(a => ({ ...a, presente }))
    );
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <User className="w-4 h-4" />
                    Profesor/Tutor
                  </p>
                  <p className="text-gray-600">
                    {supervivencia.tutor
                      ? `${supervivencia.tutor.nombre} ${supervivencia.tutor.apellido || ''}`
                      : 'Sin profesor asignado'}
                  </p>
                  {supervivencia.tutor?.especialidad && (
                    <p className="text-sm text-gray-500">{supervivencia.tutor.especialidad}</p>
                  )}
                </div>

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

            {/* Resumen de Asistencias */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Asistencia de Hoy
              </h2>

              {asistenciasData && fechaAsistencia === new Date().toISOString().split('T')[0] ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-900">Presentes</span>
                    <span className="text-2xl font-bold text-green-600">
                      {asistenciasData.estadisticas.presentes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-red-900">Ausentes</span>
                    <span className="text-2xl font-bold text-red-600">
                      {asistenciasData.estadisticas.ausentes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Sin Registrar</span>
                    <span className="text-2xl font-bold text-gray-600">
                      {asistenciasData.estadisticas.sinRegistrar}
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

          {/* Tab de Beneficiarios */}
          {activeTab === 'beneficiarios' && (
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
          )}

          {/* Tab de Asistencia */}
          {activeTab === 'asistencia' && (
            <div className="bg-white rounded-lg shadow">
              {/* Header con fecha y acciones */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      Pasar Asistencia
                    </h2>
                    <input
                      type="date"
                      value={fechaAsistencia}
                      onChange={(e) => setFechaAsistencia(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {fechasConAsistencia.includes(fechaAsistencia) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Ya registrada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => marcarTodos(true)}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Todos Presentes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => marcarTodos(false)}
                      className="flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Todos Ausentes
                    </Button>
                    <Button
                      onClick={handleGuardarAsistencia}
                      isLoading={savingAsistencia}
                      className="flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              {asistenciasData && (
                <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-6 text-sm">
                  <span className="text-gray-600">
                    Total: <strong>{asistenciasData.estadisticas.total}</strong>
                  </span>
                  <span className="text-green-600">
                    Presentes: <strong>{asistenciasLocales.filter(a => a.presente).length}</strong>
                  </span>
                  <span className="text-red-600">
                    Ausentes: <strong>{asistenciasLocales.filter(a => !a.presente).length}</strong>
                  </span>
                </div>
              )}

              {/* Lista de asistencia */}
              {loadingAsistencia ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : !supervivencia.beneficiarios || supervivencia.beneficiarios.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay beneficiarios inscritos para pasar asistencia</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {asistenciasData?.asistencias.map((asistencia, index) => {
                    const local = asistenciasLocales.find(a => a.beneficiario_id === asistencia.beneficiario.id);
                    return (
                      <div key={asistencia.beneficiario.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-medium">
                                {asistencia.beneficiario.nombre.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {asistencia.beneficiario.nombre} {asistencia.beneficiario.apellido || ''}
                              </p>
                              <p className="text-sm text-gray-500">
                                Código: {asistencia.beneficiario.codigo}
                              </p>
                            </div>
                          </div>

                          {/* Botones de asistencia */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAsistenciaChange(asistencia.beneficiario.id, true)}
                              className={`p-2 rounded-lg border-2 transition-colors ${
                                local?.presente === true
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-500'
                              }`}
                              title="Presente"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleAsistenciaChange(asistencia.beneficiario.id, false)}
                              className={`p-2 rounded-lg border-2 transition-colors ${
                                local?.presente === false
                                  ? 'bg-red-500 border-red-500 text-white'
                                  : 'border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500'
                              }`}
                              title="Ausente"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Campo de observaciones */}
                          <div className="hidden sm:block w-48">
                            <input
                              type="text"
                              placeholder="Observaciones..."
                              value={local?.observaciones || ''}
                              onChange={(e) => handleObservacionChange(asistencia.beneficiario.id, e.target.value)}
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
