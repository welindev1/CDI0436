'use client';

import { FileText } from 'lucide-react';

export default function ReportesHeader() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Centro de Reportes
        </h1>
        <p className="text-gray-500 mt-1">Genera vistas previas y exporta datos de asistencia</p>
      </div>
    </div>
  );
}
