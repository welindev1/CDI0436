'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import HorarioForm from '@/components/horarios/HorarioForm';
import HorarioTable from '@/components/horarios/HorarioTable';
import {
  useHorarios,
  useCreateHorario,
  useUpdateHorario,
  useDeleteHorario,
  useDesactivarHorario,
} from '@/lib/hooks';
import { Horario } from '@/lib/types';
import { Plus, Search, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function HorariosPage() {
  const { data: horarios = [], isLoading, error: loadError } = useHorarios();
  const createHorario = useCreateHorario();
  const updateHorario = useUpdateHorario();
  const deleteHorario = useDeleteHorario();
  const desactivarHorario = useDesactivarHorario();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<Horario | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState<string | null>(null);
  const [pageError, setPageError] = useState('');

  const error = loadError || pageError;

  const filteredHorarios = useMemo(() =>
    horarios.filter(h =>
      h.dia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [horarios, searchTerm]
  );

  // Agrupar horarios por día
  const horariosPorDia = useMemo(() =>
    filteredHorarios.reduce((acc, horario) => {
      if (!acc[horario.dia]) {
        acc[horario.dia] = [];
      }
      acc[horario.dia].push(horario);
      return acc;
    }, {} as Record<string, Horario[]>),
    [filteredHorarios]
  );

  const diasFiltrados = useMemo(() => {
    const diasOrdenados = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    return diasOrdenados.filter(dia => horariosPorDia[dia]);
  }, [horariosPorDia]);

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
        await updateHorario.mutateAsync({ id: selectedHorario.id, data });
      } else {
        await createHorario.mutateAsync(data);
      }
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al guardar';
      throw new Error(msg);
    }
  };

  const handleDeleteClick = (id: string) => {
    setHorarioToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!horarioToDelete) return;

    try {
      await deleteHorario.mutateAsync(horarioToDelete);
      setShowDeleteConfirm(false);
      setHorarioToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al eliminar horario';
      setPageError(msg);
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      await desactivarHorario.mutateAsync(id);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
        : 'Error al desactivar horario';
      setPageError(msg);
    }
  };

  return (
    <ProtectedRoute requiredPermisos={['horarios:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Horarios</h1>
              <p className="text-gray-600 mt-1">Gestión de horarios de clases</p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2 w-full sm:w-auto justify-center">
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
              {error instanceof Error ? error.message : 'Error al cargar'}
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
          <HorarioTable
            horarios={horarios}
            diasFiltrados={diasFiltrados}
            horariosPorDia={horariosPorDia}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDesactivar={handleDesactivar}
            onDelete={handleDeleteClick}
            onCreate={handleCreate}
          />
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
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
