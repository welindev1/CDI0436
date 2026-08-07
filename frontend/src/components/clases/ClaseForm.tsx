'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import type { Clase, Tutor, Horario } from '@/lib/types';
import { tutoresApi } from '@/lib/api/tutores';
import { horariosApi } from '@/lib/api/horarios';
import { getTurnoLabel } from '@/lib/utils/formatters';

const diasLabel: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

interface ClaseFormProps {
  clase?: Clase;
  onSubmit: (data: Partial<Clase>) => Promise<void>;
  onCancel: () => void;
}

export default function ClaseForm({ clase, onSubmit, onCancel }: ClaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    tutorId: '',
    horarioIds: [] as string[],
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
        horarioIds: clase.horarios?.map(h => h.id) || [],
        capacidad_maxima: clase.capacidad_maxima?.toString() || '',
      });
    }
  }, [clase]);

  const loadTutoresYHorarios = async () => {
    try {
      const [tutoresData, horariosData] = await Promise.all([
        tutoresApi.getAll(),
        horariosApi.getAll(),
      ]);
      setTutores(tutoresData.filter(t => t.tipo === 'clase' || t.tipo === 'ambos'));
      setHorarios(horariosData);
    } catch (err: unknown) {
      setError('Error al cargar tutores y horarios');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.horarioIds.length === 0) {
      setError('Debes seleccionar al menos un horario');
      return;
    }

    setIsLoading(true);

    try {
      const data: Partial<Clase> & Record<string, unknown> = {
        ...formData,
        capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : 0,
      };

      // Remover campos vacíos (excepto horarioIds que es un array)
      for (const key of Object.keys(data)) {
        if (key !== 'horarioIds' && (data[key] === '' || data[key] === undefined)) {
          delete data[key];
        }
      }

      await onSubmit(data as Partial<Clase>);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar clase');
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

  const handleHorarioToggle = (horarioId: string) => {
    setFormData(prev => ({
      ...prev,
      horarioIds: prev.horarioIds.includes(horarioId)
        ? prev.horarioIds.filter(id => id !== horarioId)
        : [...prev.horarioIds, horarioId]
    }));
  };

  const tutorOptions = tutores.map(t => ({
    value: t.id,
    label: `${t.nombre} ${t.apellido || ''}`.trim()
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horarios * <span className="text-xs text-gray-500 font-normal">(selecciona uno o más)</span>
          </label>
          {horarios.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay horarios disponibles</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {horarios.map(h => {
                const isSelected = formData.horarioIds.includes(h.id);
                return (
                  <label
                    key={h.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-300'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleHorarioToggle(h.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                      {diasLabel[h.dia] || h.dia} - {getTurnoLabel(h.hora_inicio)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          {formData.horarioIds.length > 0 && (
            <p className="mt-1 text-xs text-blue-600">
              {formData.horarioIds.length} horario(s) seleccionado(s)
            </p>
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