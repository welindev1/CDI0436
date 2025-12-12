'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { clasesApi } from '@/lib/api/clases';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { FileDown, FileSpreadsheet, Search } from 'lucide-react';

interface FiltrosReporteProps {
  tipoReporte: 'clase' | 'beneficiario';
  onGenerar: (filtros: any, formato: 'pdf' | 'excel') => void;
  isLoading?: boolean;
}

export default function FiltrosReporte({ tipoReporte, onGenerar, isLoading }: FiltrosReporteProps) {
  const [filtros, setFiltros] = useState({
    id: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [opciones, setOpciones] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    loadOpciones();
  }, [tipoReporte]);

  const loadOpciones = async () => {
    try {
      if (tipoReporte === 'clase') {
        const clases = await clasesApi.getAll();
        setOpciones(clases.map(c => ({
          value: c.id,
          label: `${c.nombre} ${c.codigo ? `(${c.codigo})` : ''}`
        })));
      } else {
        const beneficiarios = await beneficiariosApi.getAll();
        setOpciones(beneficiarios.map(b => ({
          value: b.id,
          label: `${b.nombre} ${b.apellido || ''} (${b.codigo})`
        })));
      }
    } catch (error) {
      console.error('Error al cargar opciones:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGenerar = (formato: 'pdf' | 'excel') => {
    if (!filtros.id) {
      alert(`Por favor selecciona ${tipoReporte === 'clase' ? 'una clase' : 'un beneficiario'}`);
      return;
    }
    onGenerar(filtros, formato);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Filtros del Reporte
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label={tipoReporte === 'clase' ? 'Seleccionar Clase *' : 'Seleccionar Beneficiario *'}
          name="id"
          value={filtros.id}
          onChange={handleChange}
          options={opciones}
          required
        />

        <Input
          label="Fecha Inicio"
          name="fechaInicio"
          type="date"
          value={filtros.fechaInicio}
          onChange={handleChange}
        />

        <Input
          label="Fecha Fin"
          name="fechaFin"
          type="date"
          value={filtros.fechaFin}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <Button
          onClick={() => handleGenerar('pdf')}
          disabled={isLoading || !filtros.id}
          className="flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </Button>
        <Button
          onClick={() => handleGenerar('excel')}
          disabled={isLoading || !filtros.id}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}