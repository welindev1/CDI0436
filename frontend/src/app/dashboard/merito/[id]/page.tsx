'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useDashboardPeriodo, useAgregarNotaMerito, useGenerarGanadoresMerito } from '@/lib/hooks';
import { MeritoStats } from '@/components/merito/MeritoStats';
import { NotasTable } from '@/components/merito/NotasTable';
import { NotaForm } from '@/components/merito/NotaForm';
import { GanadoresList } from '@/components/merito/GanadoresList';
import { Search, ArrowLeft, Loader2, Trophy, Award, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BeneficiarioPendiente, GanadoresResponse, GanadorMerito, ModoGanadores, NotaMerito } from '@/lib/types';

export default function PeriodoDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const periodoId = id as string;

  const [activeTab, setActiveTab] = useState<'faltan' | 'registradas'>('faltan');
  const [searchTerm, setSearchTerm] = useState('');
  const [estudianteActivo, setEstudianteActivo] = useState<BeneficiarioPendiente | null>(null);
  const [notasForm, setNotasForm] = useState({
    ciclo: 'Primaria',
    curso: 1,
    matematicas: '',
    lengua_espanola: '',
    naturales: '',
    sociales: '',
  });

  // Ganadores state
  const [modalGanadores, setModalGanadores] = useState(false);
  const [modoGanadores, setModoGanadores] = useState<ModoGanadores>('cantidad');
  const [cantPrimaria, setCantPrimaria] = useState(3);
  const [cantSecundaria, setCantSecundaria] = useState(3);
  const [minPrimaria, setMinPrimaria] = useState(90);
  const [maxPrimaria, setMaxPrimaria] = useState(100);
  const [minSecundaria, setMinSecundaria] = useState(90);
  const [maxSecundaria, setMaxSecundaria] = useState(100);
  const [previewGanadores, setPreviewGanadores] = useState<GanadoresResponse | null>(null);
  const [mostrarPreview, setMostrarPreview] = useState(false);

  // Hooks
  const { data, isLoading } = useDashboardPeriodo(periodoId);
  const agregarNota = useAgregarNotaMerito();
  const generarGanadores = useGenerarGanadoresMerito();

  const filtrados = useMemo(() => {
    if (!data) return { faltan: [] as BeneficiarioPendiente[], registradas: [] as NotaMerito[] };
    const term = searchTerm.toLowerCase();
    return {
      faltan: data.faltan_por_entregar.filter(
        (b) =>
          b.nombre.toLowerCase().includes(term) ||
          (b.apellido && b.apellido.toLowerCase().includes(term)) ||
          b.codigo.toLowerCase().includes(term)
      ),
      registradas: data.notas_registradas.filter(
        (n) =>
          n.nombre.toLowerCase().includes(term) ||
          (n.apellido && n.apellido.toLowerCase().includes(term)) ||
          n.codigo.toLowerCase().includes(term)
      ),
    };
  }, [data, searchTerm]);

  const handleDigitarNotas = (estudiante: BeneficiarioPendiente) => {
    setEstudianteActivo(estudiante);
    setNotasForm({
      ciclo: 'Primaria',
      curso: 1,
      matematicas: '',
      lengua_espanola: '',
      naturales: '',
      sociales: '',
    });
  };

  const handleEditNota = (nota: NotaMerito) => {
    setEstudianteActivo({
      id: nota.beneficiario_id,
      nombre: nota.nombre,
      apellido: nota.apellido,
      codigo: nota.codigo,
    });
    setNotasForm({
      ciclo: nota.ciclo,
      curso: nota.curso,
      matematicas: String(nota.matematicas),
      lengua_espanola: String(nota.lengua_espanola),
      naturales: String(nota.naturales),
      sociales: String(nota.sociales),
    });
  };

  const submitNotas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteActivo) return;

    agregarNota.mutate(
      {
        periodoId,
        data: {
          beneficiario_id: estudianteActivo.id,
          ciclo: notasForm.ciclo,
          curso: Number(notasForm.curso),
          matematicas: Number(notasForm.matematicas),
          lengua_espanola: Number(notasForm.lengua_espanola),
          naturales: Number(notasForm.naturales),
          sociales: Number(notasForm.sociales),
        },
      },
      {
        onSuccess: () => {
          setEstudianteActivo(null);
        },
        onError: (error: unknown) => {
          const msg = error instanceof Error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || error.message
            : 'Error al guardar notas';
          alert(msg);
        },
      }
    );
  };

  const cargarVistaPrevia = async () => {
    const payload =
      modoGanadores === 'rango_nota'
        ? {
            periodoId,
            cantPrimaria,
            cantSecundaria,
            minPrimaria,
            maxPrimaria,
            minSecundaria,
            maxSecundaria,
          }
        : { periodoId, cantPrimaria, cantSecundaria };

    generarGanadores.mutate(payload, {
      onSuccess: (result) => {
        setPreviewGanadores(result);
        setMostrarPreview(true);
      },
      onError: () => alert('Error al obtener los ganadores'),
    });
  };

  const generarPDFGanadores = () => {
    if (!previewGanadores) return;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      doc.setFontSize(22);
      doc.setTextColor(0, 51, 153);
      doc.text('Cuadro de Honor - Mérito Estudiantil', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text(`Periodo: ${data?.periodo.nombre}`, pageWidth / 2, 30, { align: 'center' });

      let currentY = 45;

      if (previewGanadores.primaria.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Ganadores Ciclo Primario', 14, currentY);
        currentY += 5;

        const datosPrimaria = previewGanadores.primaria.map((g: GanadorMerito, index: number) => [
          index + 1,
          g.codigo,
          g.nombre,
          `${g.curso}º`,
          `${Number(g.promedio).toFixed(2)}`,
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Puesto', 'Código', 'Estudiante', 'Curso', 'Promedio']],
          body: datosPrimaria,
          theme: 'striped',
          headStyles: { fillColor: [65, 105, 225] },
        });
        currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
      }

      if (previewGanadores.secundaria.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Ganadores Ciclo Secundario', 14, currentY);
        currentY += 5;

        const datosSecundaria = previewGanadores.secundaria.map((g: GanadorMerito, index: number) => [
          index + 1,
          g.codigo,
          g.nombre,
          `${g.curso}º`,
          `${Number(g.promedio).toFixed(2)}`,
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Puesto', 'Código', 'Estudiante', 'Curso', 'Promedio']],
          body: datosSecundaria,
          theme: 'striped',
          headStyles: { fillColor: [46, 139, 87] },
        });
      }

      doc.save(
        modoGanadores === 'rango_nota'
          ? `Merito_Estudiantil_${data?.periodo.anio}_P_${minPrimaria}-${maxPrimaria}_S_${minSecundaria}-${maxSecundaria}.pdf`
          : `Merito_Estudiantil_${data?.periodo.anio}_P${cantPrimaria}_S${cantSecundaria}.pdf`
      );
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      alert('Error al generar el PDF: ' + msg);
    }
  };

  return (
    <ProtectedRoute requiredPermiso="merito:ver">
      <DashboardLayout>
        {isLoading || !data ? (
          <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/dashboard/merito')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Award className="w-8 h-8 text-blue-600" />
                      {data.periodo.nombre}
                    </h1>
                    <p className="text-gray-600 mt-1">Registra las notas de este periodo</p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setPreviewGanadores(null);
                    setMostrarPreview(false);
                    setModalGanadores(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0 shadow-lg"
                >
                  <Trophy className="w-5 h-5" />
                  Generar Ganadores
                </Button>
              </div>

              {/* Stats */}
              <MeritoStats
                periodoNombre={data.periodo.nombre}
                totalFaltan={data.faltan_por_entregar.length}
                totalRegistradas={data.notas_registradas.length}
              />

              {/* Kanban / Inbox Area */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                  <div className="flex gap-2 p-1 bg-gray-200/50 rounded-lg w-full md:w-auto">
                    <button
                      onClick={() => setActiveTab('faltan')}
                      className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                        activeTab === 'faltan'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Faltan por Entregar ({data.faltan_por_entregar.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('registradas')}
                      className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'registradas'
                          ? 'bg-white text-green-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Notas Registradas ({data.notas_registradas.length})
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar alumno por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* List Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                  {activeTab === 'faltan' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filtrados.faltan.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-500">
                          No hay estudiantes pendientes con ese nombre.
                        </div>
                      ) : (
                        filtrados.faltan.map((estudiante) => (
                          <div
                            key={estudiante.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                  <Award className="w-7 h-7" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm leading-tight">
                                    {estudiante.nombre} {estudiante.apellido}
                                  </p>
                                  <p className="text-xs text-gray-500">{estudiante.codigo}</p>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleDigitarNotas(estudiante)}
                              className="w-full mt-4 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-0"
                              variant="outline"
                            >
                              Digitar Notas
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'registradas' && <NotasTable notas={filtrados.registradas} onEdit={handleEditNota} />}
                </div>
              </div>
            </div>

            {/* Modal Digitar Notas */}
            {!!estudianteActivo && (
              <Modal
                isOpen={!!estudianteActivo}
                onClose={() => setEstudianteActivo(null)}
                title={`Digitar Notas - ${estudianteActivo?.nombre}`}
              >
                <NotaForm
                  estudianteNombre={estudianteActivo.nombre}
                  values={notasForm}
                  guardando={agregarNota.isPending}
                  onChange={setNotasForm}
                  onCancel={() => setEstudianteActivo(null)}
                  onSubmit={submitNotas}
                />
              </Modal>
            )}

            {/* Modal Generar Ganadores */}
            <Modal
              isOpen={modalGanadores}
              onClose={() => {
                setModalGanadores(false);
                setMostrarPreview(false);
                setPreviewGanadores(null);
              }}
              title="Generar Cuadro de Honor"
              size="md"
            >
              <GanadoresList
                preview={previewGanadores}
                modo={modoGanadores}
                cantPrimaria={cantPrimaria}
                cantSecundaria={cantSecundaria}
                minPrimaria={minPrimaria}
                maxPrimaria={maxPrimaria}
                minSecundaria={minSecundaria}
                maxSecundaria={maxSecundaria}
                onModoChange={setModoGanadores}
                onCantPrimariaChange={setCantPrimaria}
                onCantSecundariaChange={setCantSecundaria}
                onMinPrimariaChange={setMinPrimaria}
                onMaxPrimariaChange={setMaxPrimaria}
                onMinSecundariaChange={setMinSecundaria}
                onMaxSecundariaChange={setMaxSecundaria}
                onPreview={cargarVistaPrevia}
                onDownloadPDF={generarPDFGanadores}
                onBack={() => {
                  setMostrarPreview(false);
                  setPreviewGanadores(null);
                }}
                onClose={() => {
                  setModalGanadores(false);
                  setMostrarPreview(false);
                  setPreviewGanadores(null);
                }}
                loading={generarGanadores.isPending}
                showPreview={mostrarPreview}
              />
            </Modal>
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
