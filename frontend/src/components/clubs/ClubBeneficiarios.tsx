'use client';

import { useState } from 'react';
import { Users, UserPlus, Trash2, ArrowUpDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Club, Beneficiario } from '@/lib/types';
import { useRemoverBeneficiarioClub } from '@/lib/hooks/useClubs';
import { calcularEdad } from '@/lib/utils/formatters';

interface ClubBeneficiariosProps {
  club: Club;
  puedeEditar: boolean;
  onAgregarClick: () => void;
}

type SortField = 'nombre' | 'apellido' | 'codigo' | 'edad';
type SortOrder = 'asc' | 'desc';

function getEdad(fechaNacimiento?: string): number | null {
  return calcularEdad(fechaNacimiento);
}

function getSortedBeneficiarios(
  beneficiarios: Beneficiario[],
  sortBy: SortField,
  sortOrder: SortOrder
): Beneficiario[] {
  if (!beneficiarios) return [];
  return [...beneficiarios].sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    switch (sortBy) {
      case 'nombre':
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
        break;
      case 'apellido':
        valA = (a.apellido || '').toLowerCase();
        valB = (b.apellido || '').toLowerCase();
        break;
      case 'codigo':
        valA = a.codigo.toLowerCase();
        valB = b.codigo.toLowerCase();
        break;
      case 'edad': {
        valA = a.fecha_nacimiento ? new Date(a.fecha_nacimiento).getTime() : 0;
        valB = b.fecha_nacimiento ? new Date(b.fecha_nacimiento).getTime() : 0;
        break;
      }
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

export default function ClubBeneficiarios({
  club,
  puedeEditar,
  onAgregarClick,
}: ClubBeneficiariosProps) {
  const [sortBy, setSortBy] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState<string | null>(null);

  const removerMutation = useRemoverBeneficiarioClub();

  const handleRemoverClick = (beneficiarioId: string) => {
    setBeneficiarioToDelete(beneficiarioId);
    setShowDeleteConfirm(true);
  };

  const handleRemoverConfirm = async () => {
    if (!beneficiarioToDelete || !club) return;
    try {
      await removerMutation.mutateAsync({
        id: club.id,
        beneficiarioId: beneficiarioToDelete,
      });
    } finally {
      setShowDeleteConfirm(false);
      setBeneficiarioToDelete(null);
    }
  };

  const beneficiarios = club.beneficiarios || [];
  const sortedBeneficiarios = getSortedBeneficiarios(beneficiarios, sortBy, sortOrder);

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Beneficiarios Inscritos ({beneficiarios.length})
          </h2>
          {beneficiarios.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500 font-medium">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="nombre">Nombre</option>
                <option value="apellido">Apellido</option>
                <option value="codigo">Código</option>
                <option value="edad">Edad</option>
              </select>
              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center justify-center gap-1.5"
                title={sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}
              >
                <ArrowUpDown className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline font-medium">
                  {sortOrder === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}
                </span>
              </button>
            </div>
          )}
        </div>

        {beneficiarios.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedBeneficiarios.map((beneficiario) => (
              <div
                key={beneficiario.id}
                className="p-4 hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {beneficiario.nombre.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {beneficiario.nombre} {beneficiario.apellido}
                    </p>
                    <p className="text-sm text-gray-500">
                      Código: {beneficiario.codigo}
                      {getEdad(beneficiario.fecha_nacimiento) !== null &&
                        ` • ${getEdad(beneficiario.fecha_nacimiento)} años`}
                    </p>
                  </div>
                </div>
                {puedeEditar && (
                  <button
                    onClick={() => handleRemoverClick(beneficiario.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Remover del club"
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
            <p className="text-gray-600 mb-4">No hay beneficiarios inscritos en este club</p>
            {puedeEditar && (
              <Button onClick={onAgregarClick}>
                <UserPlus className="w-5 h-5 mr-2" />
                Agregar Beneficiarios
              </Button>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar Remoción"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas remover este beneficiario del club?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleRemoverConfirm}
              isLoading={removerMutation.isPending}
            >
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
