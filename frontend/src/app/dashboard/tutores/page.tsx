'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import TutorForm from '@/components/tutores/TutorForm';
import { tutoresApi } from '@/lib/api/tutores';
import { Tutor } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCircle,
  UserX,
  BookOpen,
  Phone,
  Mail
} from 'lucide-react';

export default function TutoresPage() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tutorToDelete, setTutorToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadTutores();
  }, []);

  const loadTutores = async () => {
    try {
      setIsLoading(true);
      const data = await tutoresApi.getAll();
      setTutores(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tutores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTutor(undefined);
    setShowModal(true);
  };

  const handleEdit = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Tutor>) => {
    try {
      if (selectedTutor) {
        await tutoresApi.update(selectedTutor.id, data);
      } else {
        await tutoresApi.create(data);
      }
      setShowModal(false);
      loadTutores();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDeleteClick = (id: string) => {
    setTutorToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!tutorToDelete) return;

    try {
      await tutoresApi.delete(tutorToDelete);
      setShowDeleteConfirm(false);
      setTutorToDelete(null);
      loadTutores();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar tutor');
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      await tutoresApi.desactivar(id);
      loadTutores();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al desactivar tutor');
    }
  };

  const filteredTutores = tutores.filter(t => 
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermisos={['tutores:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tutores</h1>
              <p className="text-gray-600 mt-1">Gestión de tutores del programa</p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nuevo Tutor
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{tutores.length}</p>
                </div>
                <UserCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tutores.filter(t => t.activo).length}
                  </p>
                </div>
                <UserCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {tutores.filter(t => !t.activo).length}
                  </p>
                </div>
                <UserX className="w-8 h-8 text-gray-500" />
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
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredTutores.length === 0 ? (
              <div className="text-center py-12">
                <UserCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron tutores</p>
                <Button onClick={handleCreate} className="mt-4">
                  Crear Primer Tutor
                </Button>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell isHeader>Nombre</TableCell>
                    <TableCell isHeader>Contacto</TableCell>
                    <TableCell isHeader>Especialidad</TableCell>
                    <TableCell isHeader>Clases</TableCell>
                    <TableCell isHeader>Estado</TableCell>
                    <TableCell isHeader>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTutores.map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCircle className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {tutor.nombre} {tutor.apellido}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {tutor.telefono && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{tutor.telefono}</span>
                            </div>
                          )}
                          {tutor.correo && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{tutor.correo}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {tutor.especialidad || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span>{tutor.clases?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tutor.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tutor.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(tutor)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {tutor.activo && (
                            <button
                              onClick={() => handleDesactivar(tutor.id)}
                              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                              title="Desactivar"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(tutor.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedTutor ? 'Editar Tutor' : 'Nuevo Tutor'}
          size="lg"
        >
          <TutorForm
            tutor={selectedTutor}
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
              ¿Estás seguro de que deseas eliminar este tutor? Esta acción no se puede deshacer.
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