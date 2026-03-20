'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import SupervivenciaForm from '@/components/supervivencia/SupervivenciaForm';
import { supervivenciasApi } from '@/lib/api/supervivencias';
import { useAuth } from '@/contexts/AuthContext';
import { Supervivencia } from '@/lib/types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Users,
  Eye,
  User
} from 'lucide-react';

export default function SupervivenciaPage() {
  const { tienePermiso } = useAuth();
  const [supervivencias, setSupervivencias] = useState<Supervivencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupervivencia, setSelectedSupervivencia] = useState<Supervivencia | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supervivenciaToDelete, setSupervivenciaToDelete] = useState<string | null>(null);

  const puedeCrear = tienePermiso('supervivencia:crear');
  const puedeEditar = tienePermiso('supervivencia:editar');
  const puedeEliminar = tienePermiso('supervivencia:eliminar');

  useEffect(() => {
    loadSupervivencias();
  }, []);

  const loadSupervivencias = async () => {
    try {
      setIsLoading(true);
      const data = await supervivenciasApi.getAll();
      setSupervivencias(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cursos de supervivencia');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSupervivencia(undefined);
    setShowModal(true);
  };

  const handleEdit = (supervivencia: Supervivencia) => {
    setSelectedSupervivencia(supervivencia);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Supervivencia>) => {
    try {
      if (selectedSupervivencia) {
        await supervivenciasApi.update(selectedSupervivencia.id, data);
      } else {
        await supervivenciasApi.create(data);
      }
      setShowModal(false);
      loadSupervivencias();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDeleteClick = (id: string) => {
    setSupervivenciaToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!supervivenciaToDelete) return;

    try {
      await supervivenciasApi.delete(supervivenciaToDelete);
      setShowDeleteConfirm(false);
      setSupervivenciaToDelete(null);
      loadSupervivencias();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar curso');
    }
  };

  const filteredSupervivencias = supervivencias.filter(s =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermisos={['supervivencia:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-8 h-8 text-orange-600" />
                Supervivencia
              </h1>
              <p className="text-gray-600 mt-1">Cursos de supervivencia y capacitaciones</p>
            </div>
            {puedeCrear && (
              <Button onClick={handleCreate} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Plus className="w-5 h-5" />
                Nuevo Curso
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cursos</p>
                  <p className="text-2xl font-bold text-gray-900">{supervivencias.length}</p>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cursos Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {supervivencias.filter(s => s.activo).length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Inscritos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {supervivencias.reduce((acc, s) => acc + (s.beneficiarios?.length || 0), 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lista de Cursos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : filteredSupervivencias.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron cursos de supervivencia</p>
                {puedeCrear && (
                  <Button onClick={handleCreate} className="mt-4">
                    Crear Primer Curso
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredSupervivencias.map((supervivencia) => (
                  <div key={supervivencia.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{supervivencia.nombre}</h3>
                        {supervivencia.codigo && (
                          <p className="text-sm text-gray-500">Código: {supervivencia.codigo}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supervivencia.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {supervivencia.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Descripción */}
                    {supervivencia.descripcion && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {supervivencia.descripcion}
                      </p>
                    )}

                    {/* Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {supervivencia.tutor
                            ? `${supervivencia.tutor.nombre} ${supervivencia.tutor.apellido || ''}`
                            : 'Sin profesor'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {supervivencia.beneficiarios?.length || 0} inscrito(s)
                          {supervivencia.capacidad_maxima > 0 && ` / ${supervivencia.capacidad_maxima}`}
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <Link href={`/dashboard/supervivencia/${supervivencia.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalle
                        </Button>
                      </Link>
                      {puedeEditar && (
                        <button
                          onClick={() => handleEdit(supervivencia)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {puedeEliminar && (
                        <button
                          onClick={() => handleDeleteClick(supervivencia.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedSupervivencia ? 'Editar Curso' : 'Nuevo Curso de Supervivencia'}
          size="lg"
        >
          <SupervivenciaForm
            supervivencia={selectedSupervivencia}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>

        {/* Modal Confirmar Eliminación */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirmar Eliminación"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.
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
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
