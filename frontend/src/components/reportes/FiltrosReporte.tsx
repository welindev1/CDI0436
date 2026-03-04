'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { clasesApi } from '@/lib/api/clases';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { FileDown, FileSpreadsheet, Calendar } from 'lucide-react';

interface FiltrosReporteProps {
  tipoReporte: 'clase' | 'beneficiario';
  onGenerar: (filtros: any, formato: 'pdf' | 'excel') => void;
  isLoading?: boolean;
}

type TipoFiltroFecha = 'todo' | 'fecha' | 'rango' | 'mes';

export default function FiltrosReporte({ tipoReporte, onGenerar, isLoading }: FiltrosReporteProps) {
  const [filtros, setFiltros] = useState({
    id: '',
    tipoFiltroFecha: 'todo' as TipoFiltroFecha,
    fecha: '',
    fechaInicio: '',
    fechaFin: '',
    mes: '', // formato: YYYY-MM
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

    let fechaInicio: string | undefined;
    let fechaFin: string | undefined;
    let fechaReporte: string | undefined;

    switch (filtros.tipoFiltroFecha) {
      case 'fecha':
        fechaInicio = filtros.fecha || undefined;
        fechaFin = filtros.fecha || undefined;
        fechaReporte = filtros.fecha || undefined;
        break;
      case 'rango':
        fechaInicio = filtros.fechaInicio || undefined;
        fechaFin = filtros.fechaFin || undefined;
        if (fechaInicio && fechaFin) {
          fechaReporte = `${fechaInicio} al ${fechaFin}`;
        }
        break;
      case 'mes':
        if (filtros.mes) {
          const [year, month] = filtros.mes.split('-');
          const primerDia = new Date(parseInt(year), parseInt(month) - 1, 1);
          const ultimoDia = new Date(parseInt(year), parseInt(month), 0);
          fechaInicio = primerDia.toISOString().split('T')[0];
          fechaFin = ultimoDia.toISOString().split('T')[0];
          const nombreMes = primerDia.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
          fechaReporte = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
        }
        break;
      case 'todo':
      default:
        // Sin fechas, trae todo el historial
        fechaReporte = 'Todo el historial';
        break;
    }

    const filtrosConFecha = {
      id: filtros.id,
      fechaInicio,
      fechaFin,
      fechaReporte, // Fecha para mostrar en el reporte
    };
    onGenerar(filtrosConFecha, formato);
  };

  const tipoFiltroOpciones = [
    { value: 'todo', label: 'Todo el historial' },
    { value: 'fecha', label: 'Fecha específica' },
    { value: 'rango', label: 'Rango de fechas' },
    { value: 'mes', label: 'Mes completo' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Filtros del Reporte
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={tipoReporte === 'clase' ? 'Seleccionar Clase *' : 'Seleccionar Beneficiario *'}
          name="id"
          value={filtros.id}
          onChange={handleChange}
          options={opciones}
          required
        />

        <Select
          label="Filtrar por fecha"
          name="tipoFiltroFecha"
          value={filtros.tipoFiltroFecha}
          onChange={handleChange}
          options={tipoFiltroOpciones}
        />
      </div>

      {/* Campos de fecha según el tipo de filtro */}
      {filtros.tipoFiltroFecha === 'fecha' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha"
            name="fecha"
            type="date"
            value={filtros.fecha}
            onChange={handleChange}
          />
        </div>
      )}

      {filtros.tipoFiltroFecha === 'rango' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha inicio"
            name="fechaInicio"
            type="date"
            value={filtros.fechaInicio}
            onChange={handleChange}
          />
          <Input
            label="Fecha fin"
            name="fechaFin"
            type="date"
            value={filtros.fechaFin}
            onChange={handleChange}
          />
        </div>
      )}

      {filtros.tipoFiltroFecha === 'mes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Seleccionar mes"
            name="mes"
            type="month"
            value={filtros.mes}
            onChange={handleChange}
          />
        </div>
      )}

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