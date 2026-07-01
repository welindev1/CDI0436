'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { Supervivencia, Tutor } from '@/lib/types';
import { tutoresApi } from '@/lib/api/tutores';

interface SupervivenciaFormProps {
  supervivencia?: Supervivencia;
  onSubmit: (data: Partial<Supervivencia> & { tutor_id?: string }) => Promise<void>;
  onCancel: () => void;
}

export default function SupervivenciaForm({ supervivencia, onSubmit, onCancel }: SupervivenciaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loadingTutores, setLoadingTutores] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    capacidad_maxima: '',
    tutor_id: '',
  });

  useEffect(() => {
    loadTutores();
  }, []);

  useEffect(() => {
    if (supervivencia) {
      setFormData({
        nombre: supervivencia.nombre || '',
        descripcion: supervivencia.descripcion || '',
        codigo: supervivencia.codigo || '',
        capacidad_maxima: supervivencia.capacidad_maxima?.toString() || '',
        tutor_id: supervivencia.tutor?.id || '',
      });
    }
  }, [supervivencia]);

  const loadTutores = async () => {
    try {
      setLoadingTutores(true);
      const data = await tutoresApi.getAll({ activo: 'true' });
      setTutores(data);
    } catch (err) {
      console.error('Error al cargar tutores:', err);
    } finally {
      setLoadingTutores(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data: Record<string, unknown> = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        codigo: formData.codigo,
        capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : 0,
        tutor_id: formData.tutor_id || null,
      };

      // Remover campos vacíos excepto tutor_id (puede ser null para quitar tutor)
      for (const key of Object.keys(data)) {
        if (key !== 'tutor_id' && (data[key] === '' || data[key] === undefined)) {
          delete data[key];
        }
      }

      await onSubmit(data as Parameters<typeof onSubmit>[0]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar curso de supervivencia');
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profesor/Tutor
          </label>
          <select
            name="tutor_id"
            value={formData.tutor_id}
            onChange={(e) => setFormData(prev => ({ ...prev, tutor_id: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loadingTutores}
          >
            <option value="">Sin profesor asignado</option>
            {tutores.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.nombre} {tutor.apellido || ''} {tutor.especialidad ? `- ${tutor.especialidad}` : ''}
              </option>
            ))}
          </select>
          {loadingTutores && (
            <p className="text-xs text-gray-500 mt-1">Cargando tutores...</p>
          )}
        </div>

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
