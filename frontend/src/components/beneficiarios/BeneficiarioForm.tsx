'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { Beneficiario } from '@/lib/types';
import { calcularEdad } from '@/lib/utils/formatters';

interface BeneficiarioFormProps {
  beneficiario?: Beneficiario;
  onSubmit: (data: Partial<Beneficiario>) => Promise<void>;
  onCancel: () => void;
}

export default function BeneficiarioForm({ beneficiario, onSubmit, onCancel }: BeneficiarioFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    padre_tutor: '',
    fecha_nacimiento: '',
    correo: '',
  });

  useEffect(() => {
    if (beneficiario) {
      setFormData({
        codigo: beneficiario.codigo || '',
        nombre: beneficiario.nombre || '',
        apellido: beneficiario.apellido || '',
        direccion: beneficiario.direccion || '',
        telefono: beneficiario.telefono || '',
        padre_tutor: beneficiario.padre_tutor || '',
        fecha_nacimiento: beneficiario.fecha_nacimiento
          ? new Date(beneficiario.fecha_nacimiento).toISOString().split('T')[0]
          : '',
        correo: beneficiario.correo || '',
      });
    }
  }, [beneficiario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data: Partial<Beneficiario> = { ...formData };

      // Remover campos vacíos
      for (const key of Object.keys(data)) {
        const k = key as keyof typeof data;
        if (data[k] === '' || data[k] === undefined) {
          delete data[k];
        }
      }

      await onSubmit(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar beneficiario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const edadCalculada = formData.fecha_nacimiento ? calcularEdad(formData.fecha_nacimiento) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Código *"
          name="codigo"
          value={formData.codigo}
          onChange={handleChange}
          required
          disabled={!!beneficiario}
          placeholder="BEN001"
        />

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

        <div>
          <Input
            label="Fecha de Nacimiento"
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
          />
          {edadCalculada !== null && (
            <p className="text-sm text-blue-600 mt-1 font-medium">
              Edad: {edadCalculada} años
            </p>
          )}
        </div>

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

        <Input
          label="Padre/Tutor"
          name="padre_tutor"
          value={formData.padre_tutor}
          onChange={handleChange}
          placeholder="María Pérez"
        />

        <Input
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Calle Principal #123"
          className="md:col-span-2"
        />
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
          {beneficiario ? 'Actualizar' : 'Crear'} Beneficiario
        </Button>
      </div>
    </form>
  );
}