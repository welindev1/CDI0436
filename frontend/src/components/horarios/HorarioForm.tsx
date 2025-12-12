'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import { Horario } from '@/lib/types';

interface HorarioFormProps {
  horario?: Horario;
  onSubmit: (data: Partial<Horario>) => Promise<void>;
  onCancel: () => void;
}

const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

export default function HorarioForm({ horario, onSubmit, onCancel }: HorarioFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    dia: '',
    hora_inicio: '',
    hora_fin: '',
    descripcion: '',
  });

  useEffect(() => {
    if (horario) {
      setFormData({
        dia: horario.dia || '',
        hora_inicio: horario.hora_inicio || '',
        hora_fin: horario.hora_fin || '',
        descripcion: horario.descripcion || '',
      });
    }
  }, [horario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación de horas
    if (formData.hora_inicio >= formData.hora_fin) {
      setError('La hora de fin debe ser mayor que la hora de inicio');
      return;
    }

    setIsLoading(true);

    try {
      const data: any = { ...formData };

      // Remover campos vacíos
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === undefined) {
          delete data[key];
        }
      });

      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Error al guardar horario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Día de la Semana *"
          name="dia"
          value={formData.dia}
          onChange={handleChange}
          options={diasSemana}
          required
        />

        <Input
          label="Hora de Inicio *"
          name="hora_inicio"
          type="time"
          value={formData.hora_inicio}
          onChange={handleChange}
          required
          placeholder="08:00"
        />

        <Input
          label="Hora de Fin *"
          name="hora_fin"
          type="time"
          value={formData.hora_fin}
          onChange={handleChange}
          required
          placeholder="10:00"
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Horario matutino, Clases de matemáticas..."
          />
        </div>
      </div>

      {/* Vista previa */}
      {formData.dia && formData.hora_inicio && formData.hora_fin && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-1">Vista Previa:</p>
          <p className="text-blue-700">
            <span className="capitalize font-medium">{formData.dia}</span>
            {' '}de{' '}
            <span className="font-medium">{formData.hora_inicio}</span>
            {' '}a{' '}
            <span className="font-medium">{formData.hora_fin}</span>
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {horario ? 'Actualizar' : 'Crear'} Horario
        </Button>
      </div>
    </form>
  );
}