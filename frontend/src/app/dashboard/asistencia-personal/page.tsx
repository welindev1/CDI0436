'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Alert from '@/components/ui/Alert';
import TrabajadorCard from '@/components/asistencia-personal/TrabajadorCard';
import MarcarEntradaModal from '@/components/asistencia-personal/MarcarEntradaModal';
import MarcarSalidaModal from '@/components/asistencia-personal/MarcarSalidaModal';
import { useTrabajadores, useAsistenciaPersonal, asistenciaPersonalKeys, useActualizarNotas } from '@/lib/hooks';
import { marcarEntrada, marcarSalida, descargarPdfDiario, descargarPdfSemanal, descargarPdfMensual } from '@/lib/api/asistencia-personal';
import { useMutation } from '@tanstack/react-query';
import { UserCheck, Users, Clock, XCircle, FileText, Download, MessageSquare, Save, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

function getSunday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() + (day === 0 ? 0 : 7 - day);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

export default function AsistenciaPersonalPage() {
  const today = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(today);
  const [turno, setTurno] = useState<'matutino' | 'vespertino'>('matutino');

  const [entradaModalOpen, setEntradaModalOpen] = useState(false);
  const [salidaModalOpen, setSalidaModalOpen] = useState(false);
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState<string | null>(null);
  const [selectedFechaAsistencia, setSelectedFechaAsistencia] = useState<string>('');

  const [observaciones, setObservaciones] = useState('');
  const [reportesOpen, setReportesOpen] = useState(false);
  const [reporteTipo, setReporteTipo] = useState<'diario' | 'semanal' | 'mensual'>('diario');
  const [reporteMes, setReporteMes] = useState(new Date().getMonth() + 1);
  const [reporteAnio, setReporteAnio] = useState(new Date().getFullYear());
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  const { data: trabajadores = [], isLoading: loadingTrabajadores, error: errorTrabajadores } = useTrabajadores();
  const { data: asistencias = [], isLoading: loadingAsistencias, error: errorAsistencias } = useAsistenciaPersonal(fecha, turno);

  const queryClient = useQueryClient();
  const notasMutation = useActualizarNotas();

  const entradaMutation = useMutation({
    mutationFn: ({ trabajadorId, data }: { trabajadorId: string; data: Parameters<typeof marcarEntrada>[1] }) =>
      marcarEntrada(trabajadorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaPersonalKeys.asistencias() });
    },
  });

  const salidaMutation = useMutation({
    mutationFn: ({ trabajadorId, data }: { trabajadorId: string; data: Parameters<typeof marcarSalida>[1] }) =>
      marcarSalida(trabajadorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaPersonalKeys.asistencias() });
    },
  });

  const error = errorTrabajadores || errorAsistencias;
  const isLoading = loadingTrabajadores || loadingAsistencias;

  const notasExistentes = useMemo(() => {
    const nota = asistencias.find((a) => a.notas);
    return nota?.notas || '';
  }, [asistencias]);

  const trabajadoresConAsistencia = useMemo(() => {
    return trabajadores.map(t => ({
      trabajador: t,
      asistencia: asistencias.find(a => a.trabajador.id === t.id),
    }));
  }, [trabajadores, asistencias]);

  const stats = useMemo(() => {
    const total = trabajadores.length;
    const conEntrada = asistencias.filter(a => a.hora_entrada).length;
    const conSalida = asistencias.filter(a => a.hora_entrada && a.hora_salida).length;
    const ausentes = total - conEntrada;
    const tardanzas = conEntrada - conSalida;
    return { total, conEntrada, conSalida, ausentes, tardanzas };
  }, [trabajadores, asistencias]);

  const handleMarcarEntrada = useCallback((trabajadorId: string) => {
    setSelectedTrabajadorId(trabajadorId);
    setEntradaModalOpen(true);
  }, []);

  const handleMarcarSalida = useCallback((trabajadorId: string, fechaAsistencia: string) => {
    setSelectedTrabajadorId(trabajadorId);
    setSelectedFechaAsistencia(fechaAsistencia);
    setSalidaModalOpen(true);
  }, []);

  const handleSubmitEntrada = async (data: { hora_entrada: string; notas?: string }) => {
    if (!selectedTrabajadorId) return;
    await entradaMutation.mutateAsync({
      trabajadorId: selectedTrabajadorId,
      data: { fecha, turno, hora_entrada: data.hora_entrada, notas: data.notas },
    });
  };

  const handleSubmitSalida = async (data: { hora_salida: string }) => {
    if (!selectedTrabajadorId) return;
    const fechaSalida = selectedFechaAsistencia ? selectedFechaAsistencia.split('T')[0] : fecha;
    await salidaMutation.mutateAsync({
      trabajadorId: selectedTrabajadorId,
      data: { fecha: fechaSalida, hora_salida: data.hora_salida },
    });
  };

  const handleGuardarObservaciones = async () => {
    await notasMutation.mutateAsync({
      fecha,
      turno,
      notas: observaciones,
    });
  };

  const handleDescargarPdf = async () => {
    setDescargandoPdf(true);
    try {
      let blob: Blob;
      let filename: string;

      if (reporteTipo === 'diario') {
        blob = await descargarPdfDiario(fecha, turno);
        filename = `asistencia_${fecha}_${turno}.pdf`;
      } else if (reporteTipo === 'semanal') {
        const monday = getMonday(new Date(fecha));
        const sunday = getSunday(new Date(fecha));
        blob = await descargarPdfSemanal(monday, sunday);
        filename = `asistencia_semanal_${monday}.pdf`;
      } else {
        blob = await descargarPdfMensual(reporteMes, reporteAnio);
        filename = `asistencia_${reporteAnio}_${String(reporteMes).padStart(2, '0')}.pdf`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('Error al generar el reporte PDF');
    } finally {
      setDescargandoPdf(false);
    }
  };

  return (
    <ProtectedRoute requiredPermiso="usuarios:ver">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-8 h-8 text-indigo-600" />
                Asistencia del Personal
              </h1>
              <p className="text-gray-600 mt-1">Control de entrada y salida del personal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Trabajadores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Presentes</p>
                  <p className="text-2xl font-bold text-green-600">{stats.conEntrada}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ausentes</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.ausentes}</p>
                </div>
                <XCircle className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tardanzas</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.tardanzas}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setTurno('matutino')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      turno === 'matutino'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Matutino
                  </button>
                  <button
                    onClick={() => setTurno('vespertino')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      turno === 'vespertino'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Vespertino
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700">Observaciones del día (opcional)</h3>
            </div>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escriba observaciones generales para este día y turno..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleGuardarObservaciones}
                disabled={notasMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                <Save className="w-4 h-4" />
                {notasMutation.isPending ? 'Guardando...' : 'Guardar observaciones'}
              </button>
            </div>
          </div>

          {error && (
            <Alert variant="error">
              {error instanceof Error ? error.message : 'Error al cargar datos'}
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : trabajadoresConAsistencia.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay trabajadores registrados</h3>
              <p className="text-gray-600 mt-1">Agregue trabajadores para comenzar a registrar asistencias.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trabajadoresConAsistencia.map(({ trabajador, asistencia }) => (
                <TrabajadorCard
                  key={trabajador.id}
                  trabajador={trabajador}
                  asistencia={asistencia}
                  onMarcarEntrada={handleMarcarEntrada}
                  onMarcarSalida={handleMarcarSalida}
                />
              ))}
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <button
              onClick={() => setReportesOpen(!reportesOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-700">Generar Reporte PDF</h3>
              </div>
              {reportesOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {reportesOpen && (
              <div className="px-4 pb-4 border-t">
                <div className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    {(['diario', 'semanal', 'mensual'] as const).map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setReporteTipo(tipo)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          reporteTipo === tipo
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {tipo === 'diario' ? 'Diario' : tipo === 'semanal' ? 'Semanal' : 'Mensual'}
                      </button>
                    ))}
                  </div>

                  {reporteTipo === 'diario' && (
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Fecha del reporte</label>
                        <input
                          type="date"
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Turno</label>
                        <select
                          value={turno}
                          onChange={(e) => setTurno(e.target.value as 'matutino' | 'vespertino')}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="matutino">Matutino</option>
                          <option value="vespertino">Vespertino</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {reporteTipo === 'semanal' && (
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Seleccionar fecha (genera semana completa)</label>
                        <input
                          type="date"
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="text-sm text-gray-500">
                        Del {getMonday(new Date(fecha))} al {getSunday(new Date(fecha))}
                      </div>
                    </div>
                  )}

                  {reporteTipo === 'mensual' && (
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Mes</label>
                        <select
                          value={reporteMes}
                          onChange={(e) => setReporteMes(Number(e.target.value))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {MESES_ES.map((mes, i) => (
                            <option key={i} value={i + 1}>{mes}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Año</label>
                        <select
                          value={reporteAnio}
                          onChange={(e) => setReporteAnio(Number(e.target.value))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {[2024, 2025, 2026, 2027].map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleDescargarPdf}
                    disabled={descargandoPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    {descargandoPdf ? 'Generando...' : 'Descargar PDF'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <MarcarEntradaModal
          isOpen={entradaModalOpen}
          onClose={() => setEntradaModalOpen(false)}
          onSubmit={handleSubmitEntrada}
        />

        <MarcarSalidaModal
          isOpen={salidaModalOpen}
          onClose={() => setSalidaModalOpen(false)}
          onSubmit={handleSubmitSalida}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
