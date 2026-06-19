'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { exportToPDF } from '@/lib/utils/exportPDF';
import { exportToExcel } from '@/lib/utils/exportExcel';
import { 
  FileText, Folder, Eye, Download, TrendingUp
} from 'lucide-react';

export default function ReporteCarpetasPage() {
  const [tipoExpediente, setTipoExpediente] = useState('todos');
  const [condicionCarpeta, setCondicionCarpeta] = useState('todos');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [reportData, setReportData] = useState<any>(null);
  const [activeReportContext, setActiveReportContext] = useState<any>(null);

  const handleGenerarCarpetas = async () => {
    try {
      setIsLoading(true); setError(''); setSuccess(''); setReportData(null);
      const fechaReporte = new Date().toLocaleDateString('es-DO');
      const data = await beneficiariosApi.getReporteCarpetas(tipoExpediente, condicionCarpeta);
      setReportData(data);
      setActiveReportContext({ tipo: 'carpetas', fechaReporte, tipoExpediente, condicionCarpeta });
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte de carpetas');
    } finally {
      setIsLoading(false);
    }
  };

  const generarPDFCarpetas = (data: any, tipoExped: string, condicion: string, fechaReporte: string) => {
    const subtitulo = `Tipo: ${tipoExped === 'todos' ? 'Todos' : tipoExped.toUpperCase()} | Condición: ${condicion === 'todos' ? 'Todos' : condicion === 'con_registros' ? 'Con Registros' : 'Sin Registros'}`;
    const registros = data.registros.map((item: any) => ({
      beneficiario: item.beneficiario.nombre,
      codigo: item.beneficiario.codigo || '-',
      tieneRegistros: item.tieneRegistros ? 'Sí' : 'No',
      detalles: item.expedientes.map((e: any) => e.titulo).join(', ') || 'Ninguno'
    }));

    exportToPDF({
      titulo: 'Reporte de Carpetas de Beneficiarios',
      subtitulo: subtitulo,
      fecha: fechaReporte,
      datos: registros,
      columnas: ['beneficiario', 'codigo', 'tieneRegistros', 'detalles'],
      headers: ['Beneficiario', 'Código', 'Tiene Registros', 'Detalles de Expedientes'],
      totales: [
        { label: 'Total Evaluados', value: data.estadisticas.totalEvaluados },
        { label: 'Con Registros', value: data.estadisticas.conRegistros },
        { label: 'Sin Registros', value: data.estadisticas.sinRegistros },
      ],
    });
  };

  const generarExcelCarpetas = (data: any, tipoExped: string, condicion: string) => {
    const registros = data.registros.map((item: any) => ({
      'Beneficiario': item.beneficiario.nombre,
      'Código': item.beneficiario.codigo || '-',
      'Tiene Registros': item.tieneRegistros ? 'Sí' : 'No',
      'Detalles de Expedientes': item.expedientes.map((e: any) => e.titulo).join(', ') || 'Ninguno'
    }));

    const estadisticas = [
      { Métrica: 'Tipo de Expediente', Valor: tipoExped === 'todos' ? 'Todos' : tipoExped.toUpperCase() },
      { Métrica: 'Condición', Valor: condicion === 'todos' ? 'Todos' : condicion === 'con_registros' ? 'Con Registros' : 'Sin Registros' },
      { Métrica: 'Total Evaluados', Valor: data.estadisticas.totalEvaluados },
      { Métrica: 'Con Registros', Valor: data.estadisticas.conRegistros },
      { Métrica: 'Sin Registros', Valor: data.estadisticas.sinRegistros },
    ];

    exportToExcel({
      nombreArchivo: `Reporte_Carpetas_${new Date().getTime()}`,
      hojas: [
        { nombre: 'Registros', datos: registros },
        { nombre: 'Resumen', datos: estadisticas },
      ],
    });
  };

  const handleExportar = (formato: 'pdf' | 'excel') => {
    if (!reportData || !activeReportContext) return;
    try {
      const { fechaReporte, tipoExpediente: ctxTipo, condicionCarpeta: ctxCond } = activeReportContext;
      if (formato === 'pdf') generarPDFCarpetas(reportData, ctxTipo, ctxCond, fechaReporte);
      else generarExcelCarpetas(reportData, ctxTipo, ctxCond);
      
      setSuccess(`Reporte exportado exitosamente en formato ${formato.toUpperCase()}`);
    } catch(err: any) {
      setError('Error al exportar. Verifica los datos.');
    }
  };

  const renderPreview = () => {
    if (!reportData) return null;

    const stats = [
      { label: 'Total Evaluados', value: reportData.estadisticas?.totalEvaluados || 0 },
      { label: 'Con Registros', value: reportData.estadisticas?.conRegistros || 0 },
      { label: 'Sin Registros', value: reportData.estadisticas?.sinRegistros || 0 },
    ];
    
    const subtitle = `Módulo: ${activeReportContext.tipoExpediente === 'todos' ? 'Todos' : activeReportContext.tipoExpediente.toUpperCase()} | Condición: ${activeReportContext.condicionCarpeta === 'todos' ? 'Todos' : activeReportContext.condicionCarpeta === 'con_registros' ? 'Con Registros' : 'Sin Registros'}`;
    const tableHeaders = ['Beneficiario', 'Código', 'Tiene Registros', 'Detalles de Expedientes'];
    const tableRows = reportData.registros?.map((item: any) => ({
      cells: [
        <span className="font-bold text-gray-900" key={`nom-${item.beneficiario.id}`}>{item.beneficiario.nombre}</span>,
        <span className="font-mono text-xs" key={`cod-${item.beneficiario.id}`}>{item.beneficiario.codigo || '-'}</span>,
        <span key={`reg-${item.beneficiario.id}`} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${item.tieneRegistros ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {item.tieneRegistros ? 'Sí' : 'No'}
        </span>,
        <div className="flex flex-col gap-1 text-xs" key={`det-${item.beneficiario.id}`}>
          {item.expedientes && item.expedientes.length > 0 ? (
            item.expedientes.map((e: any, i: number) => (
              <span key={i} className="text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                <span className="font-semibold text-gray-700">{e.tipo.toUpperCase()}:</span> {e.titulo}
              </span>
            ))
          ) : (
            <span className="text-gray-400 italic">Sin registros</span>
          )}
        </div>
      ],
      key: item.beneficiario.id
    })) || [];

    return (
      <div className="bg-white border-2 border-indigo-100 rounded-2xl shadow-sm overflow-hidden mt-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-6 h-6 text-indigo-600" />
              Vista Previa del Reporte
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExportar('pdf')}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
            <button
              onClick={() => handleExportar('excel')}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200 hover:bg-green-100 transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar Excel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-b border-gray-100 bg-white">
          {stats.map((stat: any, i: number) => (
            <div key={i} className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</span>
              <span className="text-3xl font-black text-indigo-600">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="p-6 overflow-x-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Detalles ({tableRows.length} registros)</h3>
          {tableRows.length > 0 ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto custom-scrollbar relative">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0 z-10 shadow-sm">
                  <tr>
                    {tableHeaders.map((header, i) => (
                      <th key={i} className="px-4 py-3 font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableRows.map((row: any, i: number) => (
                    <tr key={row.key || i} className="hover:bg-gray-50">
                      {row.cells.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="px-4 py-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <p className="text-gray-500">No hay datos para mostrar con estos filtros.</p>
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute requiredPermisos={['reportes:ver']}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Folder className="w-8 h-8 text-indigo-600" />
                Reporte de Carpetas
              </h1>
              <p className="text-gray-500 mt-1">Genera reportes sobre los expedientes de los beneficiarios</p>
            </div>
          </div>

          {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Filtros */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 text-indigo-500" /> Opciones de Búsqueda
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Módulo de Expediente</label>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={tipoExpediente}
                  onChange={(e) => setTipoExpediente(e.target.value)}
                >
                  <option value="todos">Todos los Expedientes</option>
                  <option value="documentos">Documentos Personales</option>
                  <option value="educativo">Expediente Educativo</option>
                  <option value="registro">Registro/Otros</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Condición</label>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={condicionCarpeta}
                  onChange={(e) => setCondicionCarpeta(e.target.value)}
                >
                  <option value="todos">Todos (Con y Sin Registros)</option>
                  <option value="con_registros">Tienen Registros</option>
                  <option value="sin_registros">No Tienen Registros</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
              <button onClick={handleGenerarCarpetas} disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" /> Generar Reporte
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Render de Preview */}
          {renderPreview()}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}