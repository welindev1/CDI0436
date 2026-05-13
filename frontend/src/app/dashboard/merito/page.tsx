'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { meritoApi, PeriodoMerito } from '@/lib/api/merito';
import { Award, Plus, Calendar, ChevronRight, Loader2, Trash2 } from 'lucide-react';

export default function MeritoPage() {
  const [periodos, setPeriodos] = useState<PeriodoMerito[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoPeriodo, setNuevoPeriodo] = useState({ nombre: '', anio: new Date().getFullYear() });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [periodoToDelete, setPeriodoToDelete] = useState<PeriodoMerito | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPeriodos = async () => {
    try {
      setLoading(true);
      const data = await meritoApi.getPeriodos();
      setPeriodos(data);
    } catch (error) {
      console.error('Error al cargar periodos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPeriodo.nombre) return;
    
    try {
      setIsSubmitting(true);
      await meritoApi.createPeriodo({
        nombre: nuevoPeriodo.nombre,
        anio: nuevoPeriodo.anio,
      });
      setModalOpen(false);
      setNuevoPeriodo({ nombre: '', anio: new Date().getFullYear() });
      fetchPeriodos();
    } catch (error) {
      alert('Error al crear el periodo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!periodoToDelete) return;
    try {
      setIsDeleting(true);
      await meritoApi.deletePeriodo(periodoToDelete.id);
      setDeleteModalOpen(false);
      setPeriodoToDelete(null);
      fetchPeriodos();
    } catch (error) {
      alert('Error al eliminar el periodo. Puede que tenga notas registradas.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute requiredPermiso="merito:ver">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-8 h-8 text-blue-600" />
                Mérito Estudiantil
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona los periodos de premiación y registra las notas de los estudiantes
              </p>
            </div>
            <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Periodo
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : periodos.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-medium">No hay periodos registrados</p>
                <p className="text-sm">Crea tu primer periodo para comenzar a registrar notas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {periodos.map((periodo) => (
                  <Link
                    key={periodo.id}
                    href={`/dashboard/merito/${periodo.id}`}
                    className="block group"
                  >
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all hover:shadow-md cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-12 -mt-12 opacity-50 transition-transform group-hover:scale-110" />
                      
                      <div className="flex justify-between items-start mb-4 relative">
                        <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${periodo.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                            {periodo.estado.toUpperCase()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPeriodoToDelete(periodo);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition-colors z-10 relative"
                            title="Eliminar periodo"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                          {periodo.nombre}
                        </h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          Año {periodo.anio}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
                        Entrar al periodo <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Crear Nuevo Periodo de Mérito"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Periodo
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Mérito Estudiantil 2026"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={nuevoPeriodo.nombre}
                onChange={(e) => setNuevoPeriodo({ ...nuevoPeriodo, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <input
                type="number"
                required
                min={2000}
                max={2100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={nuevoPeriodo.anio}
                onChange={(e) => setNuevoPeriodo({ ...nuevoPeriodo, anio: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Periodo'}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Eliminar Periodo"
        >
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3 text-red-800">
              <Trash2 className="w-6 h-6 shrink-0 text-red-600" />
              <div>
                <h4 className="font-bold text-red-900">¿Estás completamente seguro?</h4>
                <p className="text-sm mt-1">
                  Estás a punto de eliminar el periodo <strong>{periodoToDelete?.nombre}</strong>.
                  Si este periodo ya tiene notas de estudiantes registradas, podría dar un error o eliminar todas las notas. 
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar periodo'}
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
