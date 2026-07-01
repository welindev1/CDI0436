'use client';

import { Search, Filter, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { EstadoFiltroAyuda } from '@/lib/types';

interface AyudaFiltersProps {
  estadoFiltro: EstadoFiltroAyuda;
  onEstadoChange: (estado: EstadoFiltroAyuda) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  counts: Record<Exclude<EstadoFiltroAyuda, 'todos'> | 'todos', number>;
  onExport: () => void;
}

export function AyudaFilters({
  estadoFiltro,
  onEstadoChange,
  searchTerm,
  onSearchChange,
  counts,
  onExport,
}: AyudaFiltersProps) {
  const estados: { key: EstadoFiltroAyuda; label: string; activeClass: string; inactiveClass: string }[] = [
    { key: 'pendiente', label: `Pendientes (${counts.pendiente})`, activeClass: 'bg-yellow-500 text-white', inactiveClass: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
    { key: 'aprobada', label: `Aprobadas (${counts.aprobada})`, activeClass: 'bg-green-500 text-white', inactiveClass: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { key: 'rechazada', label: `Rechazadas (${counts.rechazada})`, activeClass: 'bg-red-500 text-white', inactiveClass: 'bg-red-50 text-red-700 hover:bg-red-100' },
    { key: 'todos', label: `Todas (${counts.todos})`, activeClass: 'bg-gray-700 text-white', inactiveClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="flex flex-wrap gap-2 mb-4">
        {estados.map(({ key, label, activeClass, inactiveClass }) => (
          <button
            key={key}
            onClick={() => onEstadoChange(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              estadoFiltro === key ? activeClass : inactiveClass
            }`}
          >
            {key === 'pendiente' && <Filter className="w-4 h-4" />}
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Exportar a Excel
        </Button>
      </div>
    </div>
  );
}
