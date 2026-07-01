'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { Tutor } from '@/lib/types';

interface TutorFormProps {
  tutor?: Tutor;
  onSubmit: (data: Partial<Tutor>) => Promise<void>;
  onCancel: () => void;
}

export default function TutorForm({ tutor, onSubmit, onCancel }: TutorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    especialidad: '',
  });

  useEffect(() => {
    if (tutor) {
      setFormData({
        nombre: tutor.nombre || '',
        apellido: tutor.apellido || '',
        telefono: tutor.telefono || '',
        correo: tutor.correo || '',
        especialidad: tutor.especialidad || '',
      });
    }
  }, [tutor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data: Partial<Tutor> = { ...formData };

      // Remover campos vacíos
      for (const key of Object.keys(data)) {
        const k = key as keyof typeof data;
        if (data[k] === '' || data[k] === undefined) {
          delete data[k];
        }
      }

      await onSubmit(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar tutor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <Input
          label="Nombre *"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Juan"
        />

        <Input
          label="Apellido"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          placeholder="Pérez"
        />

        <Input
          label="Teléfono"
          name="telefono"
          type="tel"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="809-555-1234"
        />

        <Input
          label="Correo Electrónico"
          name="correo"
          type="email"
          value={formData.correo}
          onChange={handleChange}
          placeholder="correo@example.com"
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especialidad
          </label>
          <textarea
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Matemáticas, Ciencias, Tecnología..."
          />
        </div>
      </div>

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
          {tutor ? 'Actualizar' : 'Crear'} Tutor
        </Button>
      </div>
    </form>
  );
}