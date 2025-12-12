'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import HorarioForm from '@/components/horarios/HorarioForm';
import { horariosApi } from '@/lib/api/horarios';
import { Horario } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<Horario | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadHorarios();
  }, []);

  const loadHorarios = async () => {
    try {
      setIsLoading(true);
      const data = await horariosApi.getAll();
      setHorarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar horarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedHorario(undefined);
    setShowModal(true);
  };

  const handleEdit = (horario: Horario) => {
    setSelectedHorario(horario);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Horario>) => {
    try {
      if (selectedHorario) {
        await horariosApi.update(selectedHorario.id, data);
      } else {
        await horariosApi.create(data);
      }
      setShowModal(false);
      loadHorarios();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDeleteClick = (id: string) => {
    setHorarioToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!horarioToDelete) return;

    try {
      await horariosApi.delete(horarioToDelete);
      setShowDeleteConfirm(false);
      setHorarioToDelete(null);
      loadHorarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar horario');
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      await horariosApi.desactivar(id);
      loadHorarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al desactivar horario');
    }
  };

  const filteredHorarios = horarios.filter(h => 
    h.dia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar horarios por día
  const horariosPorDia = filteredHorarios.reduce((acc, horario) => {
    if (!acc[horario.dia]) {
      acc[horario.dia] = [];
    }
    acc[horario.dia].push(horario);
    return acc;
  }, {} as Record<string, Horario[]>);

  const diasOrdenados = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const diasFiltrados = diasOrdenados.filter(dia => horariosPorDia[dia]);

  return (
    <ProtectedRoute requiredRole={['administrador', 'profesor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Horarios</h1>
              <p className="text-gray-600 mt-1">Gestión de horarios de clases</p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nuevo Horario
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Horarios</p>
                  <p className="text-2xl font-bold text-gray-900">{horarios.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {horarios.filter(h => h.activo).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {horarios.filter(h => !h.activo).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-gray-500" />
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
                placeholder="Buscar por día o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Horarios agrupados por día */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : diasFiltrados.length === 0 ? (
              <div className="bg-white rounded-lg shadow text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron horarios</p>
                <Button onClick={handleCreate} className="mt-4">
                  Crear Primer Horario
                </Button>
              </div>
            ) : (
              diasFiltrados.map(dia => (
                <div key={dia} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-blue-50 border-b border-blue-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      {dia}
                    </h3>
                  </div>
                  
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell isHeader>Hora Inicio</TableCell>
                        <TableCell isHeader>Hora Fin</TableCell>
                        <TableCell isHeader>Descripción</TableCell>
                        <TableCell isHeader>Clases Asignadas</TableCell>
                        <TableCell isHeader>Estado</TableCell>
                        <TableCell isHeader>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {horariosPorDia[dia].map((horario) => (
                        <TableRow key={horario.id}>
                          <TableCell>
                            <span className="font-medium text-blue-600">
                              {horario.hora_inicio}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-blue-600">
                              {horario.hora_fin}
                            </span>
                          </TableCell>
                          <TableCell>
                            {horario.descripcion || '-'}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              {horario.clases?.length || 0} clase(s)
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              horario.activo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {horario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(horario)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {horario.activo && (
                                <button
                                  onClick={() => handleDesactivar(horario.id)}
                                  className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                                  title="Desactivar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteClick(horario.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Eliminar"
                                disabled={(horario.clases?.length || 0) > 0}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedHorario ? 'Editar Horario' : 'Nuevo Horario'}
          size="lg"
        >
          <HorarioForm
            horario={selectedHorario}
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
              ¿Estás seguro de que deseas eliminar este horario? Esta acción no se puede deshacer.
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