'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import { Clase } from '@/lib/types';
import { tutoresApi } from '@/lib/api/tutores';
import { horariosApi } from '@/lib/api/horarios';

interface ClaseFormProps {
  clase?: Clase;
  onSubmit: (data: Partial<Clase>) => Promise<void>;
  onCancel: () => void;
}

export default function ClaseForm({ clase, onSubmit, onCancel }: ClaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tutores, setTutores] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    tutorId: '',
    horarioId: '',
    capacidad_maxima: '',
  });

  useEffect(() => {
    loadTutoresYHorarios();
  }, []);

  useEffect(() => {
    if (clase) {
      setFormData({
        nombre: clase.nombre || '',
        descripcion: clase.descripcion || '',
        codigo: clase.codigo || '',
        tutorId: clase.tutor?.id || '',
        horarioId: clase.horario?.id || '',
        capacidad_maxima: clase.capacidad_maxima?.toString() || '',
      });
    }
  }, [clase]);

  // ...existing code...

  const loadTutoresYHorarios = async () => {
    try {
      const [tutoresData, horariosData] = await Promise.all([
        tutoresApi.getAll(),
        horariosApi.getAll(),
      ]);
      setTutores(tutoresData);
      setHorarios(horariosData);
    } catch (err: any) {
      setError('Error al cargar tutores y horarios');
    }
  };

// ...existing code...

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
      setError(err.message || 'Error al guardar clase');
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

  const tutorOptions = tutores.map(t => ({
    value: t.id,
    label: `${t.nombre} ${t.apellido || ''}`.trim()
  }));

  const horarioOptions = horarios.map(h => ({
    value: h.id,
    label: `${h.dia} - ${h.hora_inicio} a ${h.hora_fin}`
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre de la Clase *"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Matemáticas Básicas"
        />

        <Input
          label="Código"
          name="codigo"
          value={formData.codigo}
          onChange={handleChange}
          placeholder="MAT-101"
          disabled={!!clase}
        />

        <Select
          label="Tutor *"
          name="tutorId"
          value={formData.tutorId}
          onChange={handleChange}
          options={tutorOptions}
          required
        />

        <Select
          label="Horario *"
          name="horarioId"
          value={formData.horarioId}
          onChange={handleChange}
          options={horarioOptions}
          required
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
            placeholder="Descripción de la clase..."
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
          {clase ? 'Actualizar' : 'Crear'} Clase
        </Button>
      </div>
    </form>
  );
}