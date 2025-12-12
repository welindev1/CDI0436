'use client';

import { useState, useEffect } from 'react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { clasesApi } from '@/lib/api/clases';
import { Clase } from '@/lib/types';
import { Calendar, BookOpen } from 'lucide-react';

interface ClaseFechaSelectorProps {
  onSelect: (claseId: string, fecha: string) => void;
  initialClaseId?: string;
  initialFecha?: string;
}

export default function ClaseFechaSelector({ 
  onSelect, 
  initialClaseId, 
  initialFecha 
}: ClaseFechaSelectorProps) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [claseId, setClaseId] = useState(initialClaseId || '');
  const [fecha, setFecha] = useState(initialFecha || new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadClases();
  }, []);

  const loadClases = async () => {
    try {
      const data = await clasesApi.getAll({ activo: true });
      setClases(data);
    } catch (err) {
      console.error('Error al cargar clases', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claseId && fecha) {
      onSelect(claseId, fecha);
    }
  };

  const claseOptions = clases.map(c => ({
    value: c.id,
    label: `${c.nombre} ${c.codigo ? `(${c.codigo})` : ''}`
  }));

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Select
            label="Clase"
            name="claseId"
            value={claseId}
            onChange={(e) => setClaseId(e.target.value)}
            options={claseOptions}
            required
          />
        </div>

        <Input
          label="Fecha"
          type="date"
          name="fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          type="submit"
          disabled={!claseId || !fecha || isLoading}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Cargar Lista
        </Button>
      </div>
    </form>
  );
}