'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Search, UserPlus } from 'lucide-react';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { Beneficiario } from '@/lib/types';

interface AgregarBeneficiariosSupervivenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgregar: (beneficiarioIds: string[]) => Promise<void>;
  beneficiariosActuales: string[];
}

export default function AgregarBeneficiariosSupervivenciaModal({
  isOpen,
  onClose,
  onAgregar,
  beneficiariosActuales
}: AgregarBeneficiariosSupervivenciaModalProps) {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadBeneficiarios();
    }
  }, [isOpen]);

  const loadBeneficiarios = async () => {
    try {
      setIsLoading(true);
      const data = await beneficiariosApi.getAll({ activo: true });
      // Filtrar los que ya están en el curso
      const disponibles = data.filter(b => !beneficiariosActuales.includes(b.id));
      setBeneficiarios(disponibles);
    } catch (err: any) {
      setError('Error al cargar beneficiarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setError('Selecciona al menos un beneficiario');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await onAgregar(selectedIds);
      setSelectedIds([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al agregar beneficiarios');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredBeneficiarios.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBeneficiarios.map(b => b.id));
    }
  };

  const filteredBeneficiarios = beneficiarios.filter(b =>
    b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Beneficiarios al Curso"
      size="lg"
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Búsqueda */}
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

        {/* Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{selectedIds.length} seleccionados</span>
          <button
            type="button"
            onClick={toggleAll}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {selectedIds.length === filteredBeneficiarios.length ? 'Deseleccionar' : 'Seleccionar'} todos
          </button>
        </div>

        {/* Lista */}
        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredBeneficiarios.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay beneficiarios disponibles</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBeneficiarios.map((beneficiario) => (
                <label
                  key={beneficiario.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(beneficiario.id)}
                    onChange={() => toggleSelection(beneficiario.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
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
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={selectedIds.length === 0}
          >
            Agregar {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
