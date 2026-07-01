'use client';

import { useState, useMemo } from 'react';
import { Users, UserPlus, Trash2, ArrowUpDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AgregarBeneficiariosModal from '@/components/clases/AgregarBeneficiariosModal';
import type { Beneficiario } from '@/lib/types';
import { calcularEdad } from '@/lib/utils/formatters';

type SortField = 'nombre' | 'apellido' | 'codigo' | 'edad';

interface ClaseBeneficiariosProps {
  beneficiarios: Beneficiario[];
  puedeEditar: boolean;
  onAgregarBeneficiarios: (ids: string[]) => Promise<void>;
  onRemoverBeneficiario: (id: string) => void;
  showAgregarModal: boolean;
  onToggleAgregarModal: (open: boolean) => void;
}

export default function ClaseBeneficiarios({
  beneficiarios,
  puedeEditar,
  onAgregarBeneficiarios,
  onRemoverBeneficiario,
  showAgregarModal,
  onToggleAgregarModal,
}: ClaseBeneficiariosProps) {
  const [sortBy, setSortBy] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState<string | null>(null);

  const sortedBeneficiarios = useMemo(() => {
    if (!beneficiarios) return [];
    return [...beneficiarios].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortBy === 'nombre') {
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
      } else if (sortBy === 'apellido') {
        valA = (a.apellido || '').toLowerCase();
        valB = (b.apellido || '').toLowerCase();
      } else if (sortBy === 'codigo') {
        valA = a.codigo.toLowerCase();
        valB = b.codigo.toLowerCase();
      } else if (sortBy === 'edad') {
        valA = a.fecha_nacimiento ? new Date(a.fecha_nacimiento).getTime() : 0;
        valB = b.fecha_nacimiento ? new Date(b.fecha_nacimiento).getTime() : 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [beneficiarios, sortBy, sortOrder]);

  const handleRemoverClick = (beneficiarioId: string) => {
    setBeneficiarioToDelete(beneficiarioId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmRemove = () => {
    if (!beneficiarioToDelete) return;
    onRemoverBeneficiario(beneficiarioToDelete);
    setShowDeleteConfirm(false);
    setBeneficiarioToDelete(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Beneficiarios Inscritos ({beneficiarios?.length || 0})
        </h2>
        {beneficiarios && beneficiarios.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500 font-medium">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="nombre">Nombre</option>
              <option value="apellido">Apellido</option>
              <option value="codigo">Código</option>
              <option value="edad">Edad</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center justify-center gap-1.5"
              title={sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}
            >
              <ArrowUpDown className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline font-medium">
                {sortOrder === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}
              </span>
            </button>
          </div>
        )}
      </div>

      {beneficiarios && beneficiarios.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {sortedBeneficiarios.map((beneficiario) => (
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
                    {beneficiario.fecha_nacimiento && ` • ${calcularEdad(beneficiario.fecha_nacimiento)} años`}
                  </p>
                </div>
              </div>
              {puedeEditar && (
                <button
                  onClick={() => handleRemoverClick(beneficiario.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Remover de la clase"
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
          <p className="text-gray-600 mb-4">No hay beneficiarios inscritos en esta clase</p>
          {puedeEditar && (
            <Button onClick={() => onToggleAgregarModal(true)}>
              <UserPlus className="w-5 h-5 mr-2" />
              Agregar Beneficiarios
            </Button>
          )}
        </div>
      )}

      {/* Modal Agregar Beneficiarios */}
      <AgregarBeneficiariosModal
        isOpen={showAgregarModal}
        onClose={() => onToggleAgregarModal(false)}
        onAgregar={onAgregarBeneficiarios}
        beneficiariosActuales={beneficiarios?.map(b => b.id) || []}
      />

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setBeneficiarioToDelete(null); }}
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
              onClick={() => { setShowDeleteConfirm(false); setBeneficiarioToDelete(null); }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmRemove}
            >
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
