'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import FiltrosReporte from '@/components/reportes/FiltrosReporte';
import { asistenciasApi } from '@/lib/api/asistencias';
import { exportToPDF } from '@/lib/utils/exportPDF';
import { exportToExcel } from '@/lib/utils/exportExcel';
import { 
  FileText, BarChart3, Users, BookOpen, Globe, Download, 
  Calendar, ListFilter, TrendingUp, FileSpreadsheet, Eye, UserCheck, UserX
} from 'lucide-react';

type TipoPeriodo = 'dia' | 'mes' | 'anio' | 'rango' | 'todo';
type TipoReporteGlobal = 'estadistico' | 'detallado';

// Helper de Formateo de Fechas en Español
const formatFechaEs = (fechaStr: string): string => {
  if (!fechaStr) return '-';
  const cleanDateStr = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
  const [year, month, day] = cleanDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const diaSemana = diasSemana[date.getDay()];
  
  const diaFormateado = day.toString().padStart(2, '0');
  const mesFormateado = month.toString().padStart(2, '0');
  
  return `${diaSemana} ${diaFormateado}/${mesFormateado}`;
};

const formatFechasExport = (registros: any[], estado: string) => {
  return (registros || [])
    .filter(r => r.estado?.toLowerCase() === estado.toLowerCase())
    .map(r => formatFechaEs(r.fecha))
    .join(', ') || '-';
};

export default function ReportesPage() {
  const [tipoReportePrincipal, setTipoReportePrincipal] = useState<'clase' | 'beneficiario' | 'tutor' | 'global' | 'ausencias'>('clase');
  
  // Estado para reporte global
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>('mes');
  const [tipoReporteGlobal, setTipoReporteGlobal] = useState<TipoReporteGlobal>('estadistico');
  const [fechaDia, setFechaDia] = useState('');
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear().toString());
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [reportData, setReportData] = useState<any>(null);
  const [activeReportContext, setActiveReportContext] = useState<any>(null);

  // Utilidades para reporte global
  const meses = [
    { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' }, { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
  ];

  const anios = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const calcularFechasGlobal = (): { fechaInicio?: string; fechaFin?: string } => {
    switch (tipoPeriodo) {
      case 'dia': return { fechaInicio: fechaDia, fechaFin: fechaDia };
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
          return { fechaInicio: `${anioSeleccionado}-01-01`, fechaFin: `${anioSeleccionado}-12-31` };
        }
        return {};
      case 'rango': return { fechaInicio, fechaFin };
      case 'todo': default: return {};
    }
  };

  const obtenerDescripcionPeriodo = (): string => {
    switch (tipoPeriodo) {
      case 'dia': return fechaDia ? new Date(fechaDia + 'T00:00:00').toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
      case 'mes':
        const mes = meses.find(m => m.value === mesSeleccionado);
        return mes ? `${mes.label} ${anioSeleccionado}` : '';
      case 'anio': return `Año ${anioSeleccionado}`;
      case 'rango':
        if (fechaInicio && fechaFin) return `${new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-DO')} - ${new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-DO')}`;
        return '';
      case 'todo': return 'Todo el historial';
      default: return '';
    }
  };

  const validarFiltrosGlobales = (): boolean => {
    switch (tipoPeriodo) {
      case 'dia':
        if (!fechaDia) { setError('Por favor selecciona una fecha'); return false; } break;
      case 'mes':
        if (!mesSeleccionado) { setError('Por favor selecciona un mes'); return false; } break;
      case 'rango':
        if (!fechaInicio || !fechaFin) { setError('Por favor selecciona las fechas de inicio y fin'); return false; }
        if (new Date(fechaInicio) > new Date(fechaFin)) { setError('La fecha de inicio no puede ser mayor a la fecha fin'); return false; }
        break;
    }
    return true;
  };

  const handleSwitchTab = (tab: 'clase'|'beneficiario'|'tutor'|'global'|'ausencias') => {
    setTipoReportePrincipal(tab);
    setReportData(null);
    setActiveReportContext(null);
    setError('');
    setSuccess('');
  };

  // Handlers Principales
  const handleGenerarEspecifco = async (filtros: any) => {
    try {
      setIsLoading(true); setError(''); setSuccess(''); setReportData(null);
      const fechaReporte = filtros.fechaReporte || new Date().toLocaleDateString('es-DO');

      let data;
      if (tipoReportePrincipal === 'clase') {
        data = await asistenciasApi.getReportePorClase(filtros.id, filtros.fechaInicio, filtros.fechaFin);
      } else if (tipoReportePrincipal === 'tutor') {
        data = await asistenciasApi.getReportePorTutor(filtros.id, filtros.fechaInicio, filtros.fechaFin);
      } else {
        data = await asistenciasApi.getReportePorBeneficiario(filtros.id, filtros.fechaInicio, filtros.fechaFin);
      }
      
      setReportData(data);
      setActiveReportContext({ tipo: tipoReportePrincipal, filtros, fechaReporte });
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerarGlobal = async () => {
    if (!validarFiltrosGlobales()) return;
    try {
      setIsLoading(true); setError(''); setSuccess(''); setReportData(null);
      const fechas = calcularFechasGlobal();
      const periodoDescripcion = obtenerDescripcionPeriodo();
      const fechaReporte = new Date().toLocaleDateString('es-DO');

      if (tipoReportePrincipal === 'ausencias') {
        const data = await asistenciasApi.getReporteAusenciasGeneral(fechas.fechaInicio, fechas.fechaFin);
        setReportData(data);
        setActiveReportContext({ tipo: 'ausencias', periodoDescripcion, fechaReporte });
      } else {
        const detallado = tipoReporteGlobal === 'detallado';
        const data = await asistenciasApi.getReporteGlobal(fechas.fechaInicio, fechas.fechaFin, detallado);
        setReportData(data);
        setActiveReportContext({ tipo: 'global', tipoGlobal: tipoReporteGlobal, periodoDescripcion, fechaReporte });
      }
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportar = (formato: 'pdf' | 'excel') => {
    if (!reportData || !activeReportContext) return;
    try {
      const { tipo, fechaReporte, periodoDescripcion, tipoGlobal } = activeReportContext;
      
      if (tipo === 'clase') {
         if (formato === 'pdf') generarPDFClase(reportData, fechaReporte);
         else generarExcelClase(reportData);
      } else if (tipo === 'beneficiario') {
         if (formato === 'pdf') generarPDFBeneficiario(reportData, fechaReporte);
         else generarExcelBeneficiario(reportData);
      } else if (tipo === 'tutor') {
         if (formato === 'pdf') generarPDFTutor(reportData, fechaReporte);
         else generarExcelTutor(reportData);
      } else if (tipo === 'global') {
         if (formato === 'pdf') generarPDFGlobal(reportData, periodoDescripcion, fechaReporte, tipoGlobal);
         else generarExcelGlobal(reportData, periodoDescripcion, tipoGlobal);
      } else if (tipo === 'ausencias') {
         if (formato === 'pdf') generarPDFAusencias(reportData, periodoDescripcion, fechaReporte);
         else generarExcelAusencias(reportData, periodoDescripcion);
      }
      setSuccess(`Reporte exportado exitosamente en formato ${formato.toUpperCase()}`);
    } catch(err: any) {
      setError('Error al exportar. Verifica los datos.');
    }
  };

  // ----- GENERADORES CLASE -----
  const generarPDFClase = (data: any, fechaReporte: string) => {
    const asistencias = data.asistenciasPorBeneficiario.map((item: any) => ({
      beneficiario: item.beneficiario.nombre,
      codigo: item.beneficiario.codigo,
      presentes: formatFechasExport(item.registros, 'presente'),
      ausentes: formatFechasExport(item.registros, 'ausente')
    }));
    exportToPDF({
      titulo: `Reporte de Asistencia - ${data.clase.nombre}`, 
      subtitulo: `${data.clase.tutor} | ${data.clase.horarios}`, 
      fecha: fechaReporte,
      datos: asistencias, 
      columnas: ['beneficiario', 'codigo', 'presentes', 'ausentes'],
      headers: ['Beneficiario', 'Código', 'Presentes', 'Ausentes (Faltas)'],
      totales: [
        { label: 'Total Registros', value: data.estadisticas.totalRegistros },
        { label: 'Presentes', value: data.estadisticas.presentes },
        { label: 'Ausentes', value: data.estadisticas.ausentes },
        { label: '% Asistencia', value: data.estadisticas.porcentajeAsistencia },
      ],
    });
  };

  const generarExcelClase = (data: any) => {
    const asistencias = data.asistenciasPorBeneficiario.map((item: any) => ({
      'Beneficiario': item.beneficiario.nombre, 
      'Código': item.beneficiario.codigo,
      'Presentes': formatFechasExport(item.registros, 'presente'),
      'Ausentes (Faltas)': formatFechasExport(item.registros, 'ausente')
    }));
    const estadisticas = [
      { Métrica: 'Total Registros', Valor: data.estadisticas.totalRegistros },
      { Métrica: 'Presentes', Valor: data.estadisticas.presentes },
      { Métrica: 'Ausentes', Valor: data.estadisticas.ausentes },
      { Métrica: '% Asistencia', Valor: data.estadisticas.porcentajeAsistencia },
    ];
    exportToExcel({
      nombreArchivo: `Reporte_Clase_${data.clase.nombre}`,
      hojas: [{ nombre: 'Asistencias', datos: asistencias }, { nombre: 'Estadísticas', datos: estadisticas }],
    });
  };

  // ----- GENERADORES BENEFICIARIO -----
  const generarPDFBeneficiario = (data: any, fechaReporte: string) => {
    const asistencias = data.asistenciasPorClase.map((item: any) => ({
      clase: item.clase.nombre, 
      codigo: item.clase.codigo || '-',
      presentes: formatFechasExport(item.registros, 'presente'),
      ausentes: formatFechasExport(item.registros, 'ausente')
    }));
    exportToPDF({
      titulo: `Reporte de Asistencia - ${data.beneficiario.nombre}`,
      subtitulo: `Código: ${data.beneficiario.codigo}${data.beneficiario.edad ? ` | Edad: ${data.beneficiario.edad} años` : ''}`,
      fecha: fechaReporte,
      datos: asistencias, 
      columnas: ['clase', 'codigo', 'presentes', 'ausentes'],
      headers: ['Clase', 'Código Clase', 'Presentes', 'Ausentes (Faltas)'],
      totales: [
        { label: 'Clases Inscritas', value: data.estadisticas.totalClasesInscritas },
        { label: 'Total Registros', value: data.estadisticas.totalRegistros },
        { label: 'Presentes', value: data.estadisticas.presentes },
        { label: 'Ausentes', value: data.estadisticas.ausentes },
        { label: '% Asistencia', value: data.estadisticas.porcentajeAsistencia },
      ],
    });
  };

  const generarExcelBeneficiario = (data: any) => {
    const asistencias = data.asistenciasPorClase.map((item: any) => ({
      'Clase': item.clase.nombre, 
      'Código Clase': item.clase.codigo || '-',
      'Presentes': formatFechasExport(item.registros, 'presente'),
      'Ausentes (Faltas)': formatFechasExport(item.registros, 'ausente')
    }));
    const estadisticas = [
      { Métrica: 'Clases Inscritas', Valor: data.estadisticas.totalClasesInscritas },
      { Métrica: 'Total Registros', Valor: data.estadisticas.totalRegistros },
      { Métrica: 'Presentes', Valor: data.estadisticas.presentes },
      { Métrica: 'Ausentes', Valor: data.estadisticas.ausentes },
      { Métrica: '% Asistencia', Valor: data.estadisticas.porcentajeAsistencia },
    ];
    exportToExcel({
      nombreArchivo: `Reporte_Beneficiario_${data.beneficiario.nombre}`,
      hojas: [
        { nombre: 'Información', datos: [{ Campo: 'Nombre', Valor: data.beneficiario.nombre }, { Campo: 'Código', Valor: data.beneficiario.codigo }] },
        { nombre: 'Asistencias', datos: asistencias },
        { nombre: 'Estadísticas', datos: estadisticas },
      ],
    });
  };

  // ----- GENERADORES TUTOR -----
  const generarPDFTutor = (data: any, fechaReporte: string) => {
    const clases = data.clases.map((item: any) => ({
      clase: item.clase.nombre,
      codigo: item.clase.codigo || '-',
      fechas: item.fechasRegistro.map((f: string) => formatFechaEs(f)).join(', ') || '-',
      totalDias: item.estadisticas.diasConAsistenciaRegistrada
    }));
    exportToPDF({
      titulo: `Reporte de Asistencia por Tutor - ${data.tutor.nombre}`,
      subtitulo: `Especialidad: ${data.tutor.especialidad || 'No especificada'}`,
      fecha: fechaReporte,
      datos: clases,
      columnas: ['clase', 'codigo', 'totalDias', 'fechas'],
      headers: ['Clase', 'Código Clase', 'Días Pasó Lista', 'Fechas de Asistencia'],
      totales: [
        { label: 'Total Clases', value: data.estadisticas.totalClasesAsignadas },
        { label: 'Días Únicos Registró', value: data.estadisticas.totalDiasConRegistroGlobal },
      ],
    });
  };

  const generarExcelTutor = (data: any) => {
    const clases = data.clases.map((item: any) => ({
      'Clase': item.clase.nombre,
      'Código Clase': item.clase.codigo || '-',
      'Días Pasó Lista': item.estadisticas.diasConAsistenciaRegistrada,
      'Fechas de Asistencia': item.fechasRegistro.map((f: string) => formatFechaEs(f)).join(', ') || '-'
    }));
    const estadisticas = [
      { Métrica: 'Total Clases', Valor: data.estadisticas.totalClasesAsignadas },
      { Métrica: 'Días Únicos Registró', Valor: data.estadisticas.totalDiasConRegistroGlobal },
    ];
    exportToExcel({
      nombreArchivo: `Reporte_Tutor_${data.tutor.nombre}`,
      hojas: [
        { nombre: 'Información', datos: [{ Campo: 'Nombre', Valor: data.tutor.nombre }, { Campo: 'Especialidad', Valor: data.tutor.especialidad || 'N/A' }] },
        { nombre: 'Clases y Asistencia', datos: clases },
        { nombre: 'Estadísticas', datos: estadisticas },
      ],
    });
  };

  // ----- GENERADORES AUSENCIAS -----
  const generarPDFAusencias = (data: any, periodo: string, fechaReporte: string) => {
    const registros = data.registros.map((item: any) => ({
      beneficiario: item.beneficiario.nombre,
      codigo: item.beneficiario.codigo || '-',
      clase: item.clase.nombre,
      tutor: item.tutor.nombre,
      fechas: (item.fechas || []).map((f: string) => formatFechaEs(f)).join(', ') || '-',
      totalFaltas: (item.fechas || []).length
    }));
    exportToPDF({
      titulo: 'Reporte General de Ausencias',
      subtitulo: `Período: ${periodo}`,
      fecha: fechaReporte,
      datos: registros,
      columnas: ['beneficiario', 'clase', 'tutor', 'totalFaltas', 'fechas'],
      headers: ['Beneficiario', 'Clase', 'Tutor', 'Total Faltas', 'Fechas de Ausencia'],
      totales: [
        { label: 'Total Ausencias', value: data.estadisticas.totalAusencias },
        { label: 'Alumnos con Faltas', value: data.estadisticas.totalBeneficiariosAusentes },
      ],
    });
  };

  const generarExcelAusencias = (data: any, periodo: string) => {
    const registros = data.registros.map((item: any) => ({
      'Beneficiario': item.beneficiario.nombre,
      'Código': item.beneficiario.codigo || '-',
      'Clase': item.clase.nombre,
      'Tutor': item.tutor.nombre,
      'Total Faltas': (item.fechas || []).length,
      'Fechas de Ausencia': (item.fechas || []).map((f: string) => formatFechaEs(f)).join(', ') || '-'
    }));
    const estadisticas = [
      { Métrica: 'Período', Valor: periodo },
      { Métrica: 'Total Ausencias', Valor: data.estadisticas.totalAusencias },
      { Métrica: 'Alumnos Distintos con Faltas', Valor: data.estadisticas.totalBeneficiariosAusentes },
    ];
    exportToExcel({
      nombreArchivo: 'Reporte_General_Ausencias',
      hojas: [
        { nombre: 'Ausencias', datos: registros },
        { nombre: 'Resumen', datos: estadisticas },
      ],
    });
  };

  // ----- GENERADORES GLOBAL -----
  const generarPDFGlobal = (data: any, periodo: string, fechaReporte: string, tipoGlobal: string) => {
    if (tipoGlobal === 'detallado') {
      const registros = data.asistenciasPorClase.flatMap((item: any) =>
        (item.asistenciasPorBeneficiario || []).map((ben: any) => ({
          clase: item.clase.nombre, 
          beneficiario: ben.beneficiario.nombre,
          codigo: ben.beneficiario.codigo,
          presentes: formatFechasExport(ben.registros, 'presente'),
          ausentes: formatFechasExport(ben.registros, 'ausente')
        }))
      );
      exportToPDF({
        titulo: 'Reporte General de Asistencia - Detallado', subtitulo: `Período: ${periodo}`, fecha: fechaReporte,
        datos: registros, 
        columnas: ['clase', 'beneficiario', 'codigo', 'presentes', 'ausentes'],
        headers: ['Clase', 'Beneficiario', 'Código', 'Presentes', 'Ausentes (Faltas)'],
        totales: [
          { label: 'Total Clases', value: data.resumen.totalClases },
          { label: 'Asistieron', value: data.estadisticasGlobales.beneficiariosPresentes },
          { label: 'No Asistieron', value: data.estadisticasGlobales.beneficiariosAusentes },
        ],
      });
    } else {
      const resumenClases = data.asistenciasPorClase.map((item: any) => ({
        clase: item.clase.nombre, tutor: item.clase.tutor,
        inscritos: item.clase.totalBeneficiarios, asistieron: item.estadisticas.beneficiariosPresentes,
        noAsistieron: item.estadisticas.beneficiariosAusentes, porcentaje: item.estadisticas.porcentajeAsistencia
      }));
      exportToPDF({
        titulo: 'Reporte General de Asistencia - Estadístico', subtitulo: `Período: ${periodo}`, fecha: fechaReporte,
        datos: resumenClases, columnas: ['clase', 'tutor', 'inscritos', 'asistieron', 'noAsistieron', 'porcentaje'],
        headers: ['Clase', 'Tutor', 'Inscritos', 'Asistieron', 'No Asistieron', '% Asist.'],
        totales: [
          { label: 'Total Clases', value: data.resumen.totalClases },
          { label: 'Asistieron', value: data.estadisticasGlobales.beneficiariosPresentes },
          { label: 'No Asistieron', value: data.estadisticasGlobales.beneficiariosAusentes },
        ],
      });
    }
  };

  const generarExcelGlobal = (data: any, periodo: string, tipoGlobal: string) => {
    const hojas: { nombre: string; datos: any[] }[] = [];
    hojas.push({
      nombre: 'Resumen',
      datos: [
        { Campo: 'Período', Valor: periodo },
        { Campo: 'Total Clases', Valor: data.resumen.totalClases },
        { Campo: '% Asistencia Global', Valor: data.estadisticasGlobales.porcentajeAsistencia },
      ]
    });
    hojas.push({
      nombre: 'Por Clase',
      datos: data.asistenciasPorClase.map((item: any) => ({
        Clase: item.clase.nombre, Tutor: item.clase.tutor,
        'Asistieron': item.estadisticas.beneficiariosPresentes, '% Asistencia': item.estadisticas.porcentajeAsistencia,
      }))
    });
    if (tipoGlobal === 'detallado') {
      const registrosDetallados = data.asistenciasPorClase.flatMap((item: any) =>
        (item.asistenciasPorBeneficiario || []).map((ben: any) => ({
          Clase: item.clase.nombre, 
          Beneficiario: ben.beneficiario.nombre,
          Código: ben.beneficiario.codigo,
          Presentes: formatFechasExport(ben.registros, 'presente'),
          Ausentes: formatFechasExport(ben.registros, 'ausente')
        }))
      );
      hojas.push({ nombre: 'Detalle', datos: registrosDetallados });
    }
    exportToExcel({ nombreArchivo: `Reporte_General_${tipoGlobal}`, hojas });
  };

  const renderDateChips = (registros: any[], estado: string, colorClass: string) => {
    const filtered = (registros || []).filter(r => r.estado?.toLowerCase() === estado.toLowerCase());
    if (filtered.length === 0) return <span className="text-gray-400 text-xs font-normal">-</span>;

    const isAusente = estado.toLowerCase() === 'ausente';

    return (
      <div className="flex flex-col gap-1.5 min-w-[120px] max-w-[280px]">
        {isAusente && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-200 shadow-sm w-fit">
            {filtered.length} {filtered.length === 1 ? 'falta' : 'faltas'}
          </span>
        )}
        <div className="flex flex-wrap gap-1">
          {filtered.map((reg, index) => (
            <span
              key={index}
              title={reg.observaciones ? `Observaciones: ${reg.observaciones}` : undefined}
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border shadow-xs transition-all hover:scale-105 cursor-default ${colorClass}`}
            >
              {formatFechaEs(reg.fecha)}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ----- RENDER PREVIEW -----
  const renderPreview = () => {
    if (!reportData || !activeReportContext) return null;
    const { tipo, tipoGlobal } = activeReportContext;

    let stats: { label: string, value: string | number }[] = [];
    let subtitle = '';
    let tableHeaders: string[] = [];
    let tableRows: any[] = [];

    if (tipo === 'clase') {
      stats = [
        { label: 'Presentes', value: reportData.estadisticas?.presentes || 0 },
        { label: 'Ausentes', value: reportData.estadisticas?.ausentes || 0 },
        { label: '% Asistencia', value: reportData.estadisticas?.porcentajeAsistencia || '0%' },
      ];
      subtitle = reportData.clase?.nombre || '';
      tableHeaders = ['Beneficiario', 'Código', 'Presentes', 'Ausentes (Faltas)'];
      tableRows = reportData.asistenciasPorBeneficiario?.map((item: any) => ({
        cells: [
          <span className="font-bold text-gray-900">{item.beneficiario.nombre}</span>,
          <span className="font-mono text-xs">{item.beneficiario.codigo}</span>,
          renderDateChips(item.registros, 'presente', 'bg-green-50 text-green-700 border-green-200'),
          renderDateChips(item.registros, 'ausente', 'bg-red-50 text-red-700 border-red-200 font-bold')
        ],
        key: item.beneficiario.id
      })) || [];
    } else if (tipo === 'beneficiario') {
      stats = [
        { label: 'Presentes', value: reportData.estadisticas?.presentes || 0 },
        { label: 'Ausentes', value: reportData.estadisticas?.ausentes || 0 },
        { label: 'Clases Inscrito', value: reportData.estadisticas?.totalClasesInscritas || 0 },
        { label: '% Asistencia', value: reportData.estadisticas?.porcentajeAsistencia || '0%' },
      ];
      subtitle = reportData.beneficiario?.nombre || '';
      tableHeaders = ['Clase', 'Código Clase', 'Presentes', 'Ausentes (Faltas)'];
      tableRows = reportData.asistenciasPorClase?.map((item: any) => ({
        cells: [
          <span className="font-bold text-gray-900">{item.clase.nombre}</span>,
          <span className="font-mono text-xs">{item.clase.codigo || '-'}</span>,
          renderDateChips(item.registros, 'presente', 'bg-green-50 text-green-700 border-green-200'),
          renderDateChips(item.registros, 'ausente', 'bg-red-50 text-red-700 border-red-200 font-bold')
        ],
        key: item.clase.id
      })) || [];
    } else if (tipo === 'tutor') {
      stats = [
        { label: 'Clases Asignadas', value: reportData.estadisticas?.totalClasesAsignadas || 0 },
        { label: 'Días Registró Lista', value: reportData.estadisticas?.totalDiasConRegistroGlobal || 0 },
      ];
      subtitle = reportData.tutor?.nombre || '';
      tableHeaders = ['Clase', 'Código Clase', 'Días Pasó Lista', 'Fechas de Registro'];
      tableRows = reportData.clases?.map((item: any) => ({
        cells: [
          <span className="font-bold text-gray-900">{item.clase.nombre}</span>,
          <span className="font-mono text-xs">{item.clase.codigo || '-'}</span>,
          <span className="font-bold text-blue-600">{item.estadisticas.diasConAsistenciaRegistrada}</span>,
          <div className="flex flex-wrap gap-1 max-w-[280px]">
            {item.fechasRegistro.length > 0 ? item.fechasRegistro.map((f: string, i: number) => (
              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border shadow-xs bg-blue-50 text-blue-700 border-blue-200 cursor-default">
                {formatFechaEs(f)}
              </span>
            )) : <span className="text-gray-400 text-xs">-</span>}
          </div>
        ],
        key: item.clase.id
      })) || [];
    } else if (tipo === 'global') {
      stats = [
        { label: 'Total Clases', value: reportData.resumen?.totalClases || 0 },
        { label: 'Total Beneficiarios', value: reportData.resumen?.totalBeneficiariosInscritos || 0 },
        { label: 'Asistieron', value: reportData.estadisticasGlobales?.beneficiariosPresentes || 0 },
        { label: '% Asistencia Global', value: reportData.estadisticasGlobales?.porcentajeAsistencia || '0%' },
      ];
      subtitle = activeReportContext.periodoDescripcion || 'Historial Completo';

      if (tipoGlobal === 'detallado') {
        tableHeaders = ['Clase', 'Beneficiario', 'Código', 'Presentes', 'Ausentes (Faltas)'];
        tableRows = reportData.asistenciasPorClase?.flatMap((item: any) =>
          (item.asistenciasPorBeneficiario || []).map((ben: any) => ({
            cells: [
              <span className="font-medium text-gray-900">{item.clase.nombre}</span>,
              <span className="font-bold text-gray-900">{ben.beneficiario.nombre}</span>,
              <span className="font-mono text-xs">{ben.beneficiario.codigo}</span>,
              renderDateChips(ben.registros, 'presente', 'bg-green-50 text-green-700 border-green-200'),
              renderDateChips(ben.registros, 'ausente', 'bg-red-50 text-red-700 border-red-200 font-bold')
            ],
            key: `${item.clase.id}-${ben.beneficiario.id}`
          }))
        ) || [];
      } else {
        tableHeaders = ['Clase', 'Tutor', 'Inscritos', 'Presentes', 'Ausentes', '% Asist.'];
        tableRows = reportData.asistenciasPorClase?.map((item: any) => ({
          cells: [
            <span className="font-medium text-gray-900">{item.clase.nombre}</span>,
            <span>{item.clase.tutor || 'Sin tutor'}</span>,
            <span>{item.clase.totalBeneficiarios}</span>,
            <span className="text-green-600 font-bold">{item.estadisticas.beneficiariosPresentes}</span>,
            <span className="text-red-600 font-bold">{item.estadisticas.beneficiariosAusentes}</span>,
            <span className="font-semibold">{item.estadisticas.porcentajeAsistencia}</span>
          ],
          key: item.clase.id
        })) || [];
      }
    } else if (tipo === 'ausencias') {
      stats = [
        { label: 'Total Ausencias', value: reportData.estadisticas?.totalAusencias || 0 },
        { label: 'Alumnos con Faltas', value: reportData.estadisticas?.totalBeneficiariosAusentes || 0 },
        { label: 'Registros Agrupados', value: reportData.estadisticas?.totalRegistros || 0 },
      ];
      subtitle = activeReportContext.periodoDescripcion || 'Historial Completo';
      tableHeaders = ['Beneficiario', 'Clase', 'Tutor', 'Fechas de Ausencia'];
      tableRows = reportData.registros?.map((item: any) => ({
        cells: [
          <div>
            <p className="font-bold text-gray-900">{item.beneficiario.nombre}</p>
            <p className="text-xs text-gray-500 font-mono">{item.beneficiario.codigo || '-'}</p>
          </div>,
          <span className="font-medium text-blue-700">{item.clase.nombre}</span>,
          <span className="text-gray-600">{item.tutor.nombre}</span>,
          <div className="flex flex-wrap gap-1 max-w-[320px]">
            {(item.fechas || []).map((f: string, i: number) => (
              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border shadow-xs bg-red-50 text-red-700 border-red-200 cursor-default">
                {formatFechaEs(f)}
              </span>
            ))}
          </div>
        ],
        key: `${item.beneficiario.id}-${item.clase.id}`
      })) || [];
    }

    return (
      <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-sm overflow-hidden mt-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-600" />
              Vista Previa del Reporte
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => handleExportar('pdf')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all active:scale-95 text-sm">
              <FileText className="w-4 h-4" /> Descargar PDF
            </button>
            <button onClick={() => handleExportar('excel')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all active:scale-95 text-sm">
              <FileSpreadsheet className="w-4 h-4" /> Descargar Excel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Métricas del Reporte</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{s.value}</p>
              </div>
            ))}
          </div>
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
                  {tableRows.map((row, i) => (
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
                <FileText className="w-8 h-8 text-blue-600" />
                Centro de Reportes
              </h1>
              <p className="text-gray-500 mt-1">Genera vistas previas y exporta datos de asistencia</p>
            </div>
          </div>

          {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Opciones Principales */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => handleSwitchTab('clase')}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                tipoReportePrincipal === 'clase' ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-blue-200 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tipoReportePrincipal === 'clase' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Por Clase</h3>
                <p className="text-xs text-gray-500 mt-1">Asistencias de una clase en específico</p>
              </div>
            </button>

            <button
              onClick={() => handleSwitchTab('beneficiario')}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                tipoReportePrincipal === 'beneficiario' ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-blue-200 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tipoReportePrincipal === 'beneficiario' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Por Beneficiario</h3>
                <p className="text-xs text-gray-500 mt-1">Historial completo de un estudiante</p>
              </div>
            </button>

            <button
              onClick={() => handleSwitchTab('tutor')}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                tipoReportePrincipal === 'tutor' ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-blue-200 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tipoReportePrincipal === 'tutor' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Por Tutor</h3>
                <p className="text-xs text-gray-500 mt-1">Control de pase de lista</p>
              </div>
            </button>

            <button
              onClick={() => handleSwitchTab('global')}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                tipoReportePrincipal === 'global' ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-blue-200 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tipoReportePrincipal === 'global' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Estadísticas Globales</h3>
                <p className="text-xs text-gray-500 mt-1">Resumen general de todas las clases</p>
              </div>
            </button>

            <button
              onClick={() => handleSwitchTab('ausencias')}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                tipoReportePrincipal === 'ausencias' ? 'border-red-500 bg-red-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-red-200 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tipoReportePrincipal === 'ausencias' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Ausencias</h3>
                <p className="text-xs text-gray-500 mt-1">Listado general de faltas</p>
              </div>
            </button>
          </div>

          {/* Area de Configuracion */}
          {tipoReportePrincipal === 'global' || tipoReportePrincipal === 'ausencias' ? (
            <div className="space-y-6">
              {/* Opciones Globales */}
              {tipoReportePrincipal === 'global' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ListFilter className="w-5 h-5 text-blue-500" /> Nivel de Detalle
                  </h2>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${tipoReporteGlobal === 'estadistico' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" className="w-4 h-4 text-blue-600" checked={tipoReporteGlobal === 'estadistico'} onChange={() => setTipoReporteGlobal('estadistico')} />
                      <div><p className="font-bold text-sm text-gray-900">Estadístico</p><p className="text-xs text-gray-500">Resumen y porcentajes</p></div>
                    </label>
                    <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${tipoReporteGlobal === 'detallado' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" className="w-4 h-4 text-blue-600" checked={tipoReporteGlobal === 'detallado'} onChange={() => setTipoReporteGlobal('detallado')} />
                      <div><p className="font-bold text-sm text-gray-900">Detallado</p><p className="text-xs text-gray-500">Incluir lista de nombres</p></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Filtros Globales */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" /> Rango de Tiempo
                </h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { value: 'dia', label: 'Un día' }, { value: 'mes', label: 'Un mes' },
                    { value: 'anio', label: 'Un año' }, { value: 'rango', label: 'Fechas personalizadas' },
                    { value: 'todo', label: 'Desde el inicio' },
                  ].map((tipo) => (
                    <button
                      key={tipo.value} onClick={() => setTipoPeriodo(tipo.value as TipoPeriodo)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        tipoPeriodo === tipo.value ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>

                {/* Inputs de Tiempo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tipoPeriodo === 'dia' && (
                    <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Día exacto</label><input type="date" value={fechaDia} onChange={(e) => setFechaDia(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                  )}
                  {tipoPeriodo === 'mes' && (
                    <>
                      <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mes</label><select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="">Seleccionar</option>{meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
                      <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Año</label><select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">{anios.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
                    </>
                  )}
                  {tipoPeriodo === 'anio' && (
                     <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Año completo</label><select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">{anios.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
                  )}
                  {tipoPeriodo === 'rango' && (
                    <>
                      <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Desde</label><input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hasta</label><input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                    </>
                  )}
                  {tipoPeriodo === 'todo' && (
                    <div className="col-span-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">Se exportará absolutamente todo el registro histórico del sistema. Puede tardar un poco.</div>
                  )}
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
                  <button onClick={handleGenerarGlobal} disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50">
                    <Calendar className="w-5 h-5" /> Ver Reporte
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <FiltrosReporte
              tipoReporte={tipoReportePrincipal}
              onGenerar={handleGenerarEspecifco}
              isLoading={isLoading}
            />
          )}

          {/* Render de Preview */}
          {renderPreview()}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}