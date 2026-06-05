'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { meritoApi, PeriodoDashboard, BeneficiarioPendiente, GanadoresResponse } from '@/lib/api/merito';
import { Award, Search, ArrowLeft, Loader2, Save, Download, Trophy, CheckCircle2, UserCircle, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PeriodoDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<PeriodoDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'faltan' | 'registradas'>('faltan');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Digitar notas state
  const [estudianteActivo, setEstudianteActivo] = useState<BeneficiarioPendiente | null>(null);
  const [notasForm, setNotasForm] = useState({
    ciclo: 'Primaria',
    curso: 1,
    matematicas: '',
    lengua_espanola: '',
    naturales: '',
    sociales: ''
  });
  const [guardandoNota, setGuardandoNota] = useState(false);

  // Ganadores state
  const [modalGanadores, setModalGanadores] = useState(false);
  const [cantPrimaria, setCantPrimaria] = useState(3);
  const [cantSecundaria, setCantSecundaria] = useState(3);
  const [generandoPreview, setGenerandoPreview] = useState(false);
  const [previewGanadores, setPreviewGanadores] = useState<GanadoresResponse | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dashboardData = await meritoApi.getDashboardPeriodo(id as string);
      setData(dashboardData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const filtrados = useMemo(() => {
    if (!data) return { faltan: [], registradas: [] };
    const term = searchTerm.toLowerCase();
    
    return {
      faltan: data.faltan_por_entregar.filter(b => 
        b.nombre.toLowerCase().includes(term) || 
        (b.apellido && b.apellido.toLowerCase().includes(term)) ||
        b.codigo.toLowerCase().includes(term)
      ),
      registradas: data.notas_registradas.filter(n => 
        n.nombre.toLowerCase().includes(term) || 
        (n.apellido && n.apellido.toLowerCase().includes(term)) ||
        n.codigo.toLowerCase().includes(term)
      )
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
      sociales: ''
    });
  };

  const submitNotas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteActivo) return;

    try {
      setGuardandoNota(true);
      await meritoApi.agregarNota(id as string, {
        beneficiario_id: estudianteActivo.id,
        ciclo: notasForm.ciclo,
        curso: Number(notasForm.curso),
        matematicas: Number(notasForm.matematicas),
        lengua_espanola: Number(notasForm.lengua_espanola),
        naturales: Number(notasForm.naturales),
        sociales: Number(notasForm.sociales),
      });
      
      setEstudianteActivo(null);
      fetchData(); // Recargar datos para mover al estudiante de tabla
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar notas');
    } finally {
      setGuardandoNota(false);
    }
  };

  const cargarVistaPrevia = async () => {
    try {
      setGenerandoPreview(true);
      const ganadores = await meritoApi.getGanadores(id as string, cantPrimaria, cantSecundaria);
      setPreviewGanadores(ganadores);
    } catch (error) {
      alert('Error al obtener los ganadores');
    } finally {
      setGenerandoPreview(false);
    }
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

        const datosPrimaria = previewGanadores.primaria.map((g, index) => [
          index + 1, g.codigo, g.nombre, `${g.curso}º`, `${Number(g.promedio).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Puesto', 'Código', 'Estudiante', 'Curso', 'Promedio']],
          body: datosPrimaria,
          theme: 'striped',
          headStyles: { fillColor: [65, 105, 225] },
        });
        currentY = (doc as any).lastAutoTable.finalY + 20;
      }

      if (previewGanadores.secundaria.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Ganadores Ciclo Secundario', 14, currentY);
        currentY += 5;

        const datosSecundaria = previewGanadores.secundaria.map((g, index) => [
          index + 1, g.codigo, g.nombre, `${g.curso}º`, `${Number(g.promedio).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Puesto', 'Código', 'Estudiante', 'Curso', 'Promedio']],
          body: datosSecundaria,
          theme: 'striped',
          headStyles: { fillColor: [46, 139, 87] },
        });
      }

      doc.save(`Merito_Estudiantil_${data?.periodo.anio}_P${cantPrimaria}_S${cantSecundaria}.pdf`);
    } catch (error: any) {
      console.error(error);
      alert('Error al generar el PDF: ' + (error.message || 'Error desconocido'));
    }
  };

  return (
    <ProtectedRoute requiredPermiso="merito:ver">
      <DashboardLayout>
        {(loading || !data) ? (
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
                setModalGanadores(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0 shadow-lg"
            >
              <Trophy className="w-5 h-5" />
              Generar Ganadores
            </Button>
          </div>

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
                    filtrados.faltan.map(estudiante => (
                      <div key={estudiante.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                              <UserCircle className="w-7 h-7" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm leading-tight">{estudiante.nombre} {estudiante.apellido}</p>
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

              {activeTab === 'registradas' && (
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciclo</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Matemáticas</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lengua Esp.</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Naturales</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sociales</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">Promedio</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filtrados.registradas.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No hay notas registradas todavía.
                          </td>
                        </tr>
                      ) : (
                        filtrados.registradas.map(nota => (
                          <tr key={nota.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{nota.nombre} {nota.apellido}</div>
                              <div className="text-xs text-gray-500">{nota.codigo}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                nota.ciclo === 'Primaria' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {nota.ciclo}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">{nota.curso}º</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{Number(nota.matematicas).toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{Number(nota.lengua_espanola).toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{Number(nota.naturales).toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{Number(nota.sociales).toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600 bg-blue-50/30">
                        <span className="font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md">{Number(nota.promedio).toFixed(2)}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
              <form onSubmit={submitNotas} className="space-y-5">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Ciclo Educativo del Estudiante</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${notasForm.ciclo === 'Primaria' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}>
                      <input type="radio" name="ciclo" value="Primaria" className="sr-only" checked={notasForm.ciclo === 'Primaria'} onChange={(e) => setNotasForm({...notasForm, ciclo: e.target.value})} />
                      <span className="font-semibold">Primaria</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${notasForm.ciclo === 'Secundaria' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}>
                      <input type="radio" name="ciclo" value="Secundaria" className="sr-only" checked={notasForm.ciclo === 'Secundaria'} onChange={(e) => setNotasForm({...notasForm, ciclo: e.target.value})} />
                      <span className="font-semibold">Secundaria</span>
                    </label>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Curso (Grado)</label>
                    <div className="grid grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6].map(c => (
                        <label key={c} className={`flex items-center justify-center py-2 border-2 rounded-lg cursor-pointer transition-all ${notasForm.curso === c ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}>
                          <input type="radio" name="curso" value={c} className="sr-only" checked={notasForm.curso === c} onChange={(e) => setNotasForm({...notasForm, curso: Number(e.target.value)})} />
                          {c}º
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Matemáticas</label><input type="number" min="0" max="100" required step="0.01" value={notasForm.matematicas} onChange={(e) => setNotasForm({...notasForm, matematicas: e.target.value})} className="w-full px-4 py-2 text-lg font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Lengua Española</label><input type="number" min="0" max="100" required step="0.01" value={notasForm.lengua_espanola} onChange={(e) => setNotasForm({...notasForm, lengua_espanola: e.target.value})} className="w-full px-4 py-2 text-lg font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">C. Naturales</label><input type="number" min="0" max="100" required step="0.01" value={notasForm.naturales} onChange={(e) => setNotasForm({...notasForm, naturales: e.target.value})} className="w-full px-4 py-2 text-lg font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">C. Sociales</label><input type="number" min="0" max="100" required step="0.01" value={notasForm.sociales} onChange={(e) => setNotasForm({...notasForm, sociales: e.target.value})} className="w-full px-4 py-2 text-lg font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                  <span className="text-sm text-blue-600 block mb-1">Promedio Calculado</span>
                  <span className="text-2xl font-black text-blue-800">
                    {notasForm.matematicas && notasForm.lengua_espanola && notasForm.naturales && notasForm.sociales 
                      ? ((Number(notasForm.matematicas) + Number(notasForm.lengua_espanola) + Number(notasForm.naturales) + Number(notasForm.sociales)) / 4).toFixed(2)
                      : '--'}
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEstudianteActivo(null)}>Cancelar</Button>
                  <Button type="submit" disabled={guardandoNota} className="flex items-center gap-2">
                    {guardandoNota ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Notas
                  </Button>
                </div>
              </form>
            </Modal>
          )}

          {/* Modal Generar Ganadores */}
          <Modal isOpen={modalGanadores} onClose={() => setModalGanadores(false)} title="Generar Cuadro de Honor" size="md">
            {!previewGanadores ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trophy className="w-8 h-8 text-yellow-600" /></div>
                  <p className="text-gray-600">Configura cuántos ganadores quieres sacar por cada ciclo.</p>
                </div>
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-700 mb-3 bg-blue-100 px-3 py-1 rounded-full text-blue-800">Primaria</span>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => setCantPrimaria(Math.max(1, cantPrimaria - 1))} className="w-10 h-10 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600">-</button>
                      <span className="text-3xl font-black text-gray-800 w-12 text-center">{cantPrimaria}</span>
                      <button onClick={() => setCantPrimaria(cantPrimaria + 1)} className="w-10 h-10 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-700 mb-3 bg-green-100 px-3 py-1 rounded-full text-green-800">Secundaria</span>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => setCantSecundaria(Math.max(1, cantSecundaria - 1))} className="w-10 h-10 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600">-</button>
                      <span className="text-3xl font-black text-gray-800 w-12 text-center">{cantSecundaria}</span>
                      <button onClick={() => setCantSecundaria(cantSecundaria + 1)} className="w-10 h-10 rounded-full bg-white border shadow-sm hover:bg-gray-50 flex items-center justify-center font-bold text-xl text-gray-600">+</button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setModalGanadores(false)}>Cancelar</Button>
                  <Button onClick={cargarVistaPrevia} disabled={generandoPreview} className="flex items-center gap-2 bg-blue-600">
                    {generandoPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    Ver Ganadores
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3"><Trophy className="w-6 h-6 text-yellow-600" /><span className="font-bold text-blue-900">Vista Previa de Ganadores</span></div>
                  <Button onClick={generarPDFGanadores} className="bg-red-600 hover:bg-red-700 flex items-center gap-2"><Download className="w-4 h-4" />Descargar PDF</Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-3">Primaria (Top {cantPrimaria})</h3>
                    <div className="space-y-2">
                      {previewGanadores.primaria.map((g, i) => (<div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"><div className="flex items-center gap-3"><span className="font-black text-gray-400 w-4">{i + 1}.</span><div><p className="font-bold text-gray-800 text-sm">{g.nombre}</p><p className="text-xs text-gray-500">{g.codigo} • Curso: {g.curso}º</p></div></div><span className="font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md">{Number(g.promedio).toFixed(2)}</span></div>))}
                      {previewGanadores.primaria.length === 0 && <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">No hay notas registradas</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3">Secundaria (Top {cantSecundaria})</h3>
                    <div className="space-y-2">
                      {previewGanadores.secundaria.map((g, i) => (<div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"><div className="flex items-center gap-3"><span className="font-black text-gray-400 w-4">{i + 1}.</span><div><p className="font-bold text-gray-800 text-sm">{g.nombre}</p><p className="text-xs text-gray-500">{g.codigo} • Curso: {g.curso}º</p></div></div><span className="font-black text-green-600 bg-green-100 px-2 py-1 rounded-md">{Number(g.promedio).toFixed(2)}</span></div>))}
                      {previewGanadores.secundaria.length === 0 && <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">No hay notas registradas</p>}
                    </div>
                  </div>
                </div>
                <div className="flex justify-start pt-4 border-t">
                  <Button variant="ghost" onClick={() => setPreviewGanadores(null)} className="text-gray-500"><ArrowLeft className="w-4 h-4 mr-2" />Volver a configurar</Button>
                </div>
              </div>
            )}
          </Modal>
        </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
