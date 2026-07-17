'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface MarcarSalidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { hora_salida: string }) => Promise<void>;
}

export default function MarcarSalidaModal({ isOpen, onClose, onSubmit }: MarcarSalidaModalProps) {
  const [horaSalida, setHoraSalida] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setHoraSalida(`${hh}:${mm}`);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horaSalida) {
      setError('La hora de salida es requerida');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({ hora_salida: horaSalida });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar salida');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Salida" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora de Salida
          </label>
          <input
            type="time"
            value={horaSalida}
            onChange={(e) => setHoraSalida(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="bg-orange-500 hover:bg-orange-600">
            Registrar Salida
          </Button>
        </div>
      </form>
    </Modal>
  );
}
