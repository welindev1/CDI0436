'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import { asistenciasApi } from '@/lib/api/asistencias';
import { exportToPDF } from '@/lib/utils/exportPDF';
import { exportToExcel } from '@/lib/utils/exportExcel';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  ListFilter,
  BookOpen,
  Users,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

type TipoPeriodo = 'dia' | 'mes' | 'anio' | 'rango' | 'todo';
type TipoReporte = 'estadistico' | 'detallado';

export default function ReportesGeneralesPage() {
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>('mes');
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('estadistico');
  const [fechaDia, setFechaDia] = useState('');
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear().toString());
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const anios = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const calcularFechas = (): { fechaInicio?: string; fechaFin?: string } => {
    switch (tipoPeriodo) {
      case 'dia':
        return { fechaInicio: fechaDia, fechaFin: fechaDia };
      case 'mes':
        if (mesSeleccionado && anioSeleccionado) {
          const ultimoDia = new Date(parseInt(anioSeleccionado), parseInt(mesSeleccionado), 0).getDate();
          return {
            fechaInicio: `${anioSeleccionado}-${mesSeleccionado}-01`,
            fechaFin: `${anioSeleccionado}-${mesSeleccionado}-${ultimoDia.toString().padStart(2, '0')}`
          };
        }
        return {};
      case 'anio':
        if (anioSeleccionado) {
          return {
            fechaInicio: `${anioSeleccionado}-01-01`,
            fechaFin: `${anioSeleccionado}-12-31`
          };
        }
        return {};
      case 'rango':
        return { fechaInicio, fechaFin };
      case 'todo':
      default:
        return {};
    }
  };

  const obtenerDescripcionPeriodo = (): string => {
    switch (tipoPeriodo) {
      case 'dia':
        return fechaDia ? new Date(fechaDia + 'T00:00:00').toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
      case 'mes':
        const mes = meses.find(m => m.value === mesSeleccionado);
        return mes ? `${mes.label} ${anioSeleccionado}` : '';
      case 'anio':
        return `Año ${anioSeleccionado}`;
      case 'rango':
        if (fechaInicio && fechaFin) {
          return `${new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-DO')} - ${new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-DO')}`;
        }
        return '';
      case 'todo':
        return 'Todo el historial';
      default:
        return '';
    }
  };

  const validarFiltros = (): boolean => {
    switch (tipoPeriodo) {
      case 'dia':
        if (!fechaDia) {
          setError('Por favor selecciona una fecha');
          return false;
        }
        break;
      case 'mes':
        if (!mesSeleccionado) {
          setError('Por favor selecciona un mes');
          return false;
        }
        break;
      case 'rango':
        if (!fechaInicio || !fechaFin) {
          setError('Por favor selecciona las fechas de inicio y fin');
          return false;
        }
        if (new Date(fechaInicio) > new Date(fechaFin)) {
          setError('La fecha de inicio no puede ser mayor a la fecha fin');
          return false;
        }
        break;
    }
    return true;
  };

  const handleExportar = async (formato: 'pdf' | 'excel') => {
    if (!validarFiltros()) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const fechas = calcularFechas();
      const detallado = tipoReporte === 'detallado';

      const data = await asistenciasApi.getReporteGlobal(
        fechas.fechaInicio,
        fechas.fechaFin,
        detallado
      );

      const periodoDescripcion = obtenerDescripcionPeriodo();
      const fechaReporte = new Date().toLocaleDateString('es-DO');

      if (formato === 'pdf') {
        generarPDF(data, periodoDescripcion, fechaReporte);
      } else {
        generarExcel(data, periodoDescripcion);
      }

      setSuccess(`Reporte exportado exitosamente en formato ${formato.toUpperCase()}`);
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const generarPDF = (data: any, periodo: string, fechaReporte: string) => {
    if (tipoReporte === 'detallado') {
      // PDF detallado - incluye registros por beneficiario
      const registros = data.asistenciasPorClase.flatMap((item: any) =>
        (item.asistenciasPorBeneficiario || []).flatMap((ben: any) =>
          ben.registros.map((reg: any) => ({
            clase: item.clase.nombre,
            beneficiario: ben.beneficiario.nombre,
            codigo: ben.beneficiario.codigo,
            fecha: new Date(reg.fecha).toLocaleDateString('es-DO'),
            estado: reg.estado,
            observaciones: reg.observaciones || '-'
          }))
        )
      );

      exportToPDF({
        titulo: 'Reporte General de Asistencia - Detallado',
        subtitulo: `Período: ${periodo}`,
        fecha: fechaReporte,
        datos: registros,
        columnas: ['clase', 'beneficiario', 'codigo', 'fecha', 'estado', 'observaciones'],
        headers: ['Clase', 'Beneficiario', 'Código', 'Fecha', 'Estado', 'Observaciones'],
        totales: [
          { label: 'Total Clases', value: data.resumen.totalClases },
          { label: 'Beneficiarios que Asistieron', value: data.estadisticasGlobales.beneficiariosPresentes },
          { label: 'Beneficiarios que No Asistieron', value: data.estadisticasGlobales.beneficiariosAusentes },
        ],
      });
    } else {
      // PDF estadístico - solo resumen por clase
      const resumenClases = data.asistenciasPorClase.map((item: any) => ({
        clase: item.clase.nombre,
        tutor: item.clase.tutor,
        inscritos: item.clase.totalBeneficiarios,
        asistieron: item.estadisticas.beneficiariosPresentes,
        noAsistieron: item.estadisticas.beneficiariosAusentes,
        porcentaje: item.estadisticas.porcentajeAsistencia
      }));

      exportToPDF({
        titulo: 'Reporte General de Asistencia - Estadístico',
        subtitulo: `Período: ${periodo}`,
        fecha: fechaReporte,
        datos: resumenClases,
        columnas: ['clase', 'tutor', 'inscritos', 'asistieron', 'noAsistieron', 'porcentaje'],
        headers: ['Clase', 'Tutor', 'Inscritos', 'Asistieron', 'No Asistieron', '% Asist.'],
        totales: [
          { label: 'Total Clases', value: data.resumen.totalClases },
          { label: 'Beneficiarios que Asistieron', value: data.estadisticasGlobales.beneficiariosPresentes },
          { label: 'Beneficiarios que No Asistieron', value: data.estadisticasGlobales.beneficiariosAusentes },
        ],
      });
    }
  };

  const generarExcel = (data: any, periodo: string) => {
    const hojas: { nombre: string; datos: any[] }[] = [];

    // Hoja 1: Resumen General
    hojas.push({
      nombre: 'Resumen',
      datos: [
        { Campo: 'Período', Valor: periodo },
        { Campo: 'Total Clases', Valor: data.resumen.totalClases },
        { Campo: 'Total Beneficiarios Inscritos', Valor: data.resumen.totalBeneficiariosInscritos },
        { Campo: 'Beneficiarios con Registros', Valor: data.resumen.totalBeneficiariosUnicos },
        { Campo: 'Beneficiarios que Asistieron', Valor: data.estadisticasGlobales.beneficiariosPresentes },
        { Campo: 'Beneficiarios que No Asistieron', Valor: data.estadisticasGlobales.beneficiariosAusentes },
        { Campo: '% Asistencia Global', Valor: data.estadisticasGlobales.porcentajeAsistencia },
      ]
    });

    // Hoja 2: Estadísticas por Clase
    hojas.push({
      nombre: 'Por Clase',
      datos: data.asistenciasPorClase.map((item: any) => ({
        Clase: item.clase.nombre,
        Código: item.clase.codigo,
        Tutor: item.clase.tutor,
        'Beneficiarios Inscritos': item.clase.totalBeneficiarios,
        'Asistieron': item.estadisticas.beneficiariosPresentes,
        'No Asistieron': item.estadisticas.beneficiariosAusentes,
        '% Asistencia': item.estadisticas.porcentajeAsistencia,
      }))
    });

    // Hoja 3: Detalle (si es reporte detallado)
    if (tipoReporte === 'detallado') {
      const registrosDetallados = data.asistenciasPorClase.flatMap((item: any) =>
        (item.asistenciasPorBeneficiario || []).flatMap((ben: any) =>
          ben.registros.map((reg: any) => ({
            Clase: item.clase.nombre,
            'Código Clase': item.clase.codigo,
            Beneficiario: ben.beneficiario.nombre,
            'Código Beneficiario': ben.beneficiario.codigo,
            Fecha: new Date(reg.fecha).toLocaleDateString('es-DO'),
            Estado: reg.estado,
            Observaciones: reg.observaciones || '-'
          }))
        )
      );

      hojas.push({
        nombre: 'Detalle',
        datos: registrosDetallados
      });
    }

    exportToExcel({
      nombreArchivo: `Reporte_General_${tipoReporte === 'detallado' ? 'Detallado' : 'Estadistico'}`,
      hojas
    });
  };

  return (
    <ProtectedRoute requiredPermisos={['reportes_generales:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Reportes Generales
            </h1>
            <p className="text-gray-600 mt-1">
              Genera reportes consolidados de todas las clases
            </p>
          </div>

          {/* Alertas */}
          {error && (
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Tipo de Reporte */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-gray-600" />
              Tipo de Reporte
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setTipoReporte('estadistico')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoReporte === 'estadistico'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tipoReporte === 'estadistico' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    <TrendingUp className={`w-5 h-5 ${
                      tipoReporte === 'estadistico' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Estadístico</h3>
                    <p className="text-sm text-gray-600">
                      Resumen con estadísticas por clase
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setTipoReporte('detallado')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoReporte === 'detallado'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tipoReporte === 'detallado' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    <Users className={`w-5 h-5 ${
                      tipoReporte === 'detallado' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Detallado</h3>
                    <p className="text-sm text-gray-600">
                      Incluye registros de cada beneficiario
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Filtros de Período */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Período del Reporte
            </h2>

            {/* Selector de tipo de período */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { value: 'dia', label: 'Un día' },
                { value: 'mes', label: 'Un mes' },
                { value: 'anio', label: 'Un año' },
                { value: 'rango', label: 'Rango de fechas' },
                { value: 'todo', label: 'Todo el historial' },
              ].map((tipo) => (
                <button
                  key={tipo.value}
                  onClick={() => setTipoPeriodo(tipo.value as TipoPeriodo)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tipoPeriodo === tipo.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tipo.label}
                </button>
              ))}
            </div>

            {/* Campos según tipo de período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipoPeriodo === 'dia' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={fechaDia}
                    onChange={(e) => setFechaDia(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {tipoPeriodo === 'mes' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mes
                    </label>
                    <select
                      value={mesSeleccionado}
                      onChange={(e) => setMesSeleccionado(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar mes</option>
                      {meses.map((mes) => (
                        <option key={mes.value} value={mes.value}>
                          {mes.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año
                    </label>
                    <select
                      value={anioSeleccionado}
                      onChange={(e) => setAnioSeleccionado(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {anios.map((anio) => (
                        <option key={anio.value} value={anio.value}>
                          {anio.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {tipoPeriodo === 'anio' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <select
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {anios.map((anio) => (
                      <option key={anio.value} value={anio.value}>
                        {anio.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {tipoPeriodo === 'rango' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {tipoPeriodo === 'todo' && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    Se generará un reporte con todos los registros de asistencia desde el inicio del sistema.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Exportar */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-gray-600" />
              Exportar Reporte
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleExportar('pdf')}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-5 h-5" />
                {isLoading ? 'Generando...' : 'Exportar PDF'}
              </button>
              <button
                onClick={() => handleExportar('excel')}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5" />
                {isLoading ? 'Generando...' : 'Exportar Excel'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Información sobre los reportes generales</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Reporte Estadístico:</strong> Muestra un resumen con métricas de asistencia por cada clase</li>
                  <li>• <strong>Reporte Detallado:</strong> Incluye además todos los registros individuales de asistencia</li>
                  <li>• Los reportes en Excel incluyen múltiples hojas: Resumen, Por Clase, y Detalle (si aplica)</li>
                  <li>• Las estadísticas incluyen: presentes, ausentes, justificados, tardes y porcentaje de asistencia</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
