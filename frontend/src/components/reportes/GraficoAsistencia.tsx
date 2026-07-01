'use client';

import type { StatItem } from '@/lib/types';

interface GraficoAsistenciaProps {
  stats: StatItem[];
}

export default function GraficoAsistencia({ stats }: GraficoAsistenciaProps) {
  return (
    <div className="p-6 border-b border-gray-100">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        Métricas del Reporte
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
