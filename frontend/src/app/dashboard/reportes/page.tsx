'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import FiltrosReporte from '@/components/reportes/FiltrosReporte';
import { asistenciasApi } from '@/lib/api/asistencias';
import { exportToPDF } from '@/lib/utils/exportPDF';
import { exportToExcel } from '@/lib/utils/exportExcel';
import { FileText, BarChart3, Users, BookOpen } from 'lucide-react';

export default function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState<'clase' | 'beneficiario'>('clase');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGenerarReporte = async (filtros: any, formato: 'pdf' | 'excel') => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Usar la fecha del reporte que viene de los filtros
      const fechaReporte = filtros.fechaReporte || new Date().toLocaleDateString('es-DO');

      let data;
      if (tipoReporte === 'clase') {
        data = await asistenciasApi.getReportePorClase(
          filtros.id,
          filtros.fechaInicio,
          filtros.fechaFin
        );

        if (formato === 'pdf') {
          generarPDFClase(data, fechaReporte);
        } else {
          generarExcelClase(data);
        }
      } else {
        data = await asistenciasApi.getReportePorBeneficiario(
          filtros.id,
          filtros.fechaInicio,
          filtros.fechaFin
        );

        if (formato === 'pdf') {
          generarPDFBeneficiario(data, fechaReporte);
        } else {
          generarExcelBeneficiario(data);
        }
      }

      setSuccess(`Reporte exportado exitosamente en formato ${formato.toUpperCase()}`);
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const generarPDFClase = (data: any, fechaReporte: string) => {
    const asistencias = data.asistenciasPorBeneficiario.flatMap((item: any) =>
      item.registros.map((registro: any) => ({
        beneficiario: item.beneficiario.nombre,
        codigo: item.beneficiario.codigo,
        fecha: new Date(registro.fecha).toLocaleDateString('es-DO'),
        estado: registro.estado,
        observaciones: registro.observaciones || '-'
      }))
    );

    exportToPDF({
      titulo: `Reporte de Asistencia - ${data.clase.nombre}`,
      subtitulo: `${data.clase.tutor} | ${data.clase.horarios}`,
      fecha: fechaReporte,
      datos: asistencias,
      columnas: ['beneficiario', 'codigo', 'fecha', 'estado', 'observaciones'],
      headers: ['Beneficiario', 'Código', 'Fecha', 'Estado', 'Observaciones'],
      totales: [
        { label: 'Total Registros', value: data.estadisticas.totalRegistros },
        { label: 'Presentes', value: data.estadisticas.presentes },
        { label: 'Ausentes', value: data.estadisticas.ausentes },
        { label: 'Justificados', value: data.estadisticas.justificados },
        { label: 'Tardes', value: data.estadisticas.tardes },
        { label: '% Asistencia', value: data.estadisticas.porcentajeAsistencia },
      ],
    });
  };

  const generarExcelClase = (data: any) => {
    const asistencias = data.asistenciasPorBeneficiario.flatMap((item: any) =>
      item.registros.map((registro: any) => ({
        Beneficiario: item.beneficiario.nombre,
        Código: item.beneficiario.codigo,
        Fecha: new Date(registro.fecha).toLocaleDateString('es-DO'),
        Estado: registro.estado,
        Observaciones: registro.observaciones || '-'
      }))
    );

    const estadisticas = [
      { Métrica: 'Total Registros', Valor: data.estadisticas.totalRegistros },
      { Métrica: 'Presentes', Valor: data.estadisticas.presentes },
      { Métrica: 'Ausentes', Valor: data.estadisticas.ausentes },
      { Métrica: 'Justificados', Valor: data.estadisticas.justificados },
      { Métrica: 'Tardes', Valor: data.estadisticas.tardes },
      { Métrica: '% Asistencia', Valor: data.estadisticas.porcentajeAsistencia },
    ];

    exportToExcel({
      nombreArchivo: `Reporte_Clase_${data.clase.nombre}`,
      hojas: [
        { nombre: 'Asistencias', datos: asistencias },
        { nombre: 'Estadísticas', datos: estadisticas },
      ],
    });
  };

  const generarPDFBeneficiario = (data: any, fechaReporte: string) => {
    const asistencias = data.asistenciasPorClase.flatMap((item: any) =>
      item.registros.map((registro: any) => ({
        clase: item.clase.nombre,
        codigo: item.clase.codigo || '-',
        fecha: new Date(registro.fecha).toLocaleDateString('es-DO'),
        estado: registro.estado,
        observaciones: registro.observaciones || '-'
      }))
    );

    exportToPDF({
      titulo: `Reporte de Asistencia - ${data.beneficiario.nombre}`,
      subtitulo: `Código: ${data.beneficiario.codigo}${data.beneficiario.edad ? ` | Edad: ${data.beneficiario.edad} años` : ''}`,
      fecha: fechaReporte,
      datos: asistencias,
      columnas: ['clase', 'codigo', 'fecha', 'estado', 'observaciones'],
      headers: ['Clase', 'Código', 'Fecha', 'Estado', 'Observaciones'],
      totales: [
        { label: 'Clases Inscritas', value: data.estadisticas.totalClasesInscritas },
        { label: 'Total Registros', value: data.estadisticas.totalRegistros },
        { label: 'Presentes', value: data.estadisticas.presentes },
        { label: 'Ausentes', value: data.estadisticas.ausentes },
        { label: 'Justificados', value: data.estadisticas.justificados },
        { label: 'Tardes', value: data.estadisticas.tardes },
        { label: '% Asistencia', value: data.estadisticas.porcentajeAsistencia },
      ],
    });
  };

  const generarExcelBeneficiario = (data: any) => {
    const asistencias = data.asistenciasPorClase.flatMap((item: any) =>
      item.registros.map((registro: any) => ({
        Clase: item.clase.nombre,
        Código: item.clase.codigo || '-',
        Fecha: new Date(registro.fecha).toLocaleDateString('es-DO'),
        Estado: registro.estado,
        Observaciones: registro.observaciones || '-'
      }))
    );

    const estadisticas = [
      { Métrica: 'Clases Inscritas', Valor: data.estadisticas.totalClasesInscritas },
      { Métrica: 'Total Registros', Valor: data.estadisticas.totalRegistros },
      { Métrica: 'Presentes', Valor: data.estadisticas.presentes },
      { Métrica: 'Ausentes', Valor: data.estadisticas.ausentes },
      { Métrica: 'Justificados', Valor: data.estadisticas.justificados },
      { Métrica: 'Tardes', Valor: data.estadisticas.tardes },
      { Métrica: '% Asistencia', Valor: data.estadisticas.porcentajeAsistencia },
    ];

    const info = [
      { Campo: 'Nombre', Valor: data.beneficiario.nombre },
      { Campo: 'Código', Valor: data.beneficiario.codigo },
      { Campo: 'Edad', Valor: data.beneficiario.edad || '-' },
      { Campo: 'Padre/Tutor', Valor: data.beneficiario.padre_tutor || '-' },
    ];

    exportToExcel({
      nombreArchivo: `Reporte_Beneficiario_${data.beneficiario.nombre}`,
      hojas: [
        { nombre: 'Información', datos: info },
        { nombre: 'Asistencias', datos: asistencias },
        { nombre: 'Estadísticas', datos: estadisticas },
      ],
    });
  };

  return (
    <ProtectedRoute requiredPermisos={['reportes:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Reportes de Asistencia
            </h1>
            <p className="text-gray-600 mt-1">
              Genera reportes detallados en PDF o Excel
            </p>
          </div>

          {/* Alertas */}
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              {success}
            </Alert>
          )}

          {/* Selector de tipo de reporte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setTipoReporte('clase')}
              className={`p-6 border-2 rounded-lg transition-all ${
                tipoReporte === 'clase'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  tipoReporte === 'clase' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <BookOpen className={`w-6 h-6 ${
                    tipoReporte === 'clase' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Reporte por Clase</h3>
                  <p className="text-sm text-gray-600">
                    Ver asistencias de todos los beneficiarios de una clase
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setTipoReporte('beneficiario')}
              className={`p-6 border-2 rounded-lg transition-all ${
                tipoReporte === 'beneficiario'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  tipoReporte === 'beneficiario' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <Users className={`w-6 h-6 ${
                    tipoReporte === 'beneficiario' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Reporte por Beneficiario</h3>
                  <p className="text-sm text-gray-600">
                    Ver todas las asistencias de un beneficiario
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Filtros */}
          <FiltrosReporte
            tipoReporte={tipoReporte}
            onGenerar={handleGenerarReporte}
            isLoading={isLoading}
          />

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Información sobre los reportes</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Los reportes en PDF incluyen tablas detalladas y estadísticas</li>
                  <li>• Los reportes en Excel incluyen múltiples hojas con datos estructurados</li>
                  <li>• Puedes filtrar por rango de fechas o dejar en blanco para todo el historial</li>
                  <li>• Las estadísticas incluyen: presentes, ausentes, justificados, tardes y % de asistencia</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}