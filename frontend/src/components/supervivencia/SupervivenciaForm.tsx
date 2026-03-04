'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { Supervivencia } from '@/lib/types';

interface SupervivenciaFormProps {
  supervivencia?: Supervivencia;
  onSubmit: (data: Partial<Supervivencia>) => Promise<void>;
  onCancel: () => void;
}

export default function SupervivenciaForm({ supervivencia, onSubmit, onCancel }: SupervivenciaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    capacidad_maxima: '',
  });

  useEffect(() => {
    if (supervivencia) {
      setFormData({
        nombre: supervivencia.nombre || '',
        descripcion: supervivencia.descripcion || '',
        codigo: supervivencia.codigo || '',
        capacidad_maxima: supervivencia.capacidad_maxima?.toString() || '',
      });
    }
  }, [supervivencia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data: any = {
        ...formData,
        capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : 0,
      };

      // Remover campos vacíos
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === undefined) {
          delete data[key];
        }
      });

      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Error al guardar curso de supervivencia');
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
          label="Nombre del Curso *"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Primeros Auxilios"
        />

        <Input
          label="Código"
          name="codigo"
          value={formData.codigo}
          onChange={handleChange}
          placeholder="SUP-101"
          disabled={!!supervivencia}
        />

        <Input
          label="Capacidad Máxima"
          name="capacidad_maxima"
          type="number"
          value={formData.capacidad_maxima}
          onChange={handleChange}
          placeholder="20"
          min="0"
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
            placeholder="Descripción del curso de supervivencia..."
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
          {supervivencia ? 'Actualizar' : 'Crear'} Curso
        </Button>
      </div>
    </form>
  );
}
