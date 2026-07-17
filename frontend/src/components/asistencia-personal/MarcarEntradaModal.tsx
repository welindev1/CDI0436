'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface MarcarEntradaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { hora_entrada: string; notas?: string }) => Promise<void>;
}

export default function MarcarEntradaModal({ isOpen, onClose, onSubmit }: MarcarEntradaModalProps) {
  const [horaEntrada, setHoraEntrada] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setHoraEntrada(`${hh}:${mm}`);
      setNotas('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horaEntrada) {
      setError('La hora de entrada es requerida');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({ hora_entrada: horaEntrada, notas: notas || undefined });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Entrada" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora de Entrada
          </label>
          <input
            type="time"
            value={horaEntrada}
            onChange={(e) => setHoraEntrada(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="bg-green-600 hover:bg-green-700">
            Registrar Entrada
          </Button>
        </div>
      </form>
    </Modal>
  );
}
