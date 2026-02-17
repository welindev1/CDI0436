'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import ClaseForm from '@/components/clases/ClaseForm';
import { clasesApi } from '@/lib/api/clases';
import { Clase } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen,
  Users,
  Calendar,
  Clock,
  Eye,
  UserCircle
} from 'lucide-react';

export default function ClasesPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClase, setSelectedClase] = useState<Clase | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [claseToDelete, setClaseToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadClases();
  }, []);

  const loadClases = async () => {
    try {
      setIsLoading(true);
      const data = await clasesApi.getAll();
      setClases(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedClase(undefined);
    setShowModal(true);
  };

  const handleEdit = (clase: Clase) => {
    setSelectedClase(clase);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Clase>) => {
    try {
      if (selectedClase) {
        await clasesApi.update(selectedClase.id, data);
      } else {
        await clasesApi.create(data);
      }
      setShowModal(false);
      loadClases();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDeleteClick = (id: string) => {
    setClaseToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!claseToDelete) return;

    try {
      await clasesApi.delete(claseToDelete);
      setShowDeleteConfirm(false);
      setClaseToDelete(null);
      loadClases();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar clase');
    }
  };

  const filteredClases = clases.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tutor?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermisos={['clases:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clases</h1>
              <p className="text-gray-600 mt-1">Gestión de clases y asignaciones</p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nueva Clase
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clases</p>
                  <p className="text-2xl font-bold text-gray-900">{clases.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clases Activas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {clases.filter(c => c.activo).length}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Inscritos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {clases.reduce((acc, c) => acc + (c.beneficiarios?.length || 0), 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio/Clase</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {clases.length > 0 
                      ? Math.round(clases.reduce((acc, c) => acc + (c.beneficiarios?.length || 0), 0) / clases.length)
                      : 0
                    }
                  </p>
                </div>
                <Users className="w-8 h-8 text-yellow-500" />
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
                placeholder="Buscar por nombre, código o tutor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lista de Clases */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredClases.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron clases</p>
                <Button onClick={handleCreate} className="mt-4">
                  Crear Primera Clase
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredClases.map((clase) => (
                  <div key={clase.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{clase.nombre}</h3>
                        {clase.codigo && (
                          <p className="text-sm text-gray-500">Código: {clase.codigo}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        clase.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {clase.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    {/* Descripción */}
                    {clase.descripcion && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {clase.descripcion}
                      </p>
                    )}

                    {/* Info del tutor */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <UserCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {clase.tutor?.nombre} {clase.tutor?.apellido}
                        </span>
                      </div>

                      {/* Horario */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 capitalize">
                          {clase.horario?.dia}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {clase.horario?.hora_inicio} - {clase.horario?.hora_fin}
                        </span>
                      </div>

                      {/* Inscritos */}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {clase.beneficiarios?.length || 0} inscrito(s)
                          {clase.capacidad_maxima > 0 && ` / ${clase.capacidad_maxima}`}
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <Link href={`/dashboard/clases/${clase.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalle
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleEdit(clase)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(clase.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
          title={selectedClase ? 'Editar Clase' : 'Nueva Clase'}
          size="lg"
        >
          <ClaseForm
            clase={selectedClase}
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
              ¿Estás seguro de que deseas eliminar esta clase? Esta acción no se puede deshacer.
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