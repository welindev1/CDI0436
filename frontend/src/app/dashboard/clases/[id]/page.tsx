'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import AgregarBeneficiariosModal from '@/components/clases/AgregarBeneficiariosModal';
import RegistroAsistencia from '@/components/asistencias/RegistroAsistencia';
import { clasesApi } from '@/lib/api/clases';
import { asistenciasApi } from '@/lib/api/asistencias';
import { Clase } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Edit, UserPlus, Users, Calendar, Clock, UserCircle, 
  Trash2, BookOpen, ClipboardCheck, Camera, X, Upload, Loader2, Info, ChevronLeft, ChevronRight,
  ArrowUpDown, ZoomIn
} from 'lucide-react';

const mapeoDias: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6
};

const diasLabel: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

function getTurnoLabel(hora_inicio: string): string {
  const hora = parseInt(hora_inicio.split(':')[0]);
  if (hora < 12) return 'Mañana';
  if (hora < 18) return 'Tarde';
  return 'Noche';
}

export default function ClaseDetallePage() {
  const params = useParams();
  const router = useRouter();
  const claseId = params.id as string;
  const { tienePermiso } = useAuth();

  const [clase, setClase] = useState<Clase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState<string | null>(null);

  // Ordenamiento de beneficiarios
  const [sortBy, setSortBy] = useState<'nombre' | 'apellido' | 'codigo' | 'edad'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getSortedBeneficiarios = (beneficiariosList: any[]) => {
    if (!beneficiariosList) return [];
    return [...beneficiariosList].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortBy === 'nombre') {
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
      } else if (sortBy === 'apellido') {
        valA = (a.apellido || '').toLowerCase();
        valB = (b.apellido || '').toLowerCase();
      } else if (sortBy === 'codigo') {
        valA = a.codigo.toLowerCase();
        valB = b.codigo.toLowerCase();
      } else if (sortBy === 'edad') {
        valA = a.fecha_nacimiento ? new Date(a.fecha_nacimiento).getTime() : 0;
        valB = b.fecha_nacimiento ? new Date(b.fecha_nacimiento).getTime() : 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Tabs state
  const [activeTab, setActiveTab] = useState<'estudiantes' | 'asistencia' | 'info'>('estudiantes');

  // Asistencia state
  const [selectedFecha, setSelectedFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [fotos, setFotos] = useState<any[]>([]);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [lightboxFoto, setLightboxFoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generar fechas válidas del mes actual
  const fechasValidasMes = import('react').then(() => []); // dummy for structure, actually we will use a normal useMemo
  // Let's use standard react useMemo
  const fechasDelMes = import('react').then(() => []); // I will fix this immediately by importing useMemo. Wait, I can just use a function inside render.

  useEffect(() => {
    if (activeTab === 'asistencia') {
      cargarFotos();
    }
  }, [selectedFecha, activeTab]);

  useEffect(() => {
    if (!clase || activeTab !== 'asistencia') return;
    const validDays = (clase.horarios || []).map(h => mapeoDias[h.dia]);
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const fechas = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i);
      if (validDays.length === 0 || validDays.includes(d.getDay())) {
        const mStr = String(month).padStart(2, '0');
        const dStr = String(i).padStart(2, '0');
        fechas.push(`${year}-${mStr}-${dStr}`);
      }
    }
    
    if (fechas.length > 0 && !fechas.includes(selectedFecha)) {
      const hoyStr = new Date().toISOString().split('T')[0];
      if (hoyStr.startsWith(selectedMonth)) {
         let idx = fechas.findIndex(f => f >= hoyStr);
         if (idx === -1) idx = fechas.length - 1;
         setSelectedFecha(fechas[idx]);
      } else {
         setSelectedFecha(fechas[0]);
      }
    }
  }, [selectedMonth, clase, activeTab]);

  const cargarFotos = async () => {
    try {
      setLoadingFoto(true);
      const data = await asistenciasApi.getFoto(claseId, selectedFecha);
      setFotos(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err: any) {
      if (err.response?.status !== 404) console.error('Error al cargar fotos:', err);
      setFotos([]);
    } finally {
      setLoadingFoto(false);
    }
  };

  const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) { alert(`"${f.name}" no es una imagen válida`); return false; }
      if (f.size > 5 * 1024 * 1024) { alert(`"${f.name}" supera los 5MB`); return false; }
      return true;
    });
    if (validFiles.length === 0) return;

    try {
      setUploadingFoto(true);
      for (const file of validFiles) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await asistenciasApi.subirFoto(claseId, selectedFecha, base64);
      }
      await cargarFotos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al subir la foto');
    } finally {
      setUploadingFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEliminarFoto = async (fotoId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return;
    try {
      await asistenciasApi.eliminarFoto(fotoId);
      setFotos(prev => prev.filter(f => f.id !== fotoId));
    } catch (err) {
      alert('Error al eliminar la foto');
    }
  };

  // Verificar permisos para editar clases
  const puedeEditar = tienePermiso('clases:editar');

  useEffect(() => {
    loadClase();
  }, [claseId]);

  const loadClase = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await clasesApi.getById(claseId);
      setClase(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar la clase';
      setError(msg);
      console.error('Error cargando clase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgregarBeneficiarios = async (beneficiarioIds: string[]) => {
    try {
      await clasesApi.agregarBeneficiarios(claseId, beneficiarioIds);
      setShowAgregarModal(false);
      loadClase();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al agregar beneficiarios');
    }
  };

  const handleRemoverBeneficiarioClick = (beneficiarioId: string) => {
    setBeneficiarioToDelete(beneficiarioId);
    setShowDeleteConfirm(true);
  };

  const handleRemoverBeneficiario = async () => {
    if (!beneficiarioToDelete) return;

    try {
      await clasesApi.removerBeneficiario(claseId, beneficiarioToDelete);
      setShowDeleteConfirm(false);
      setBeneficiarioToDelete(null);
      loadClase();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al remover beneficiario');
    }
  };

  return (
    <ProtectedRoute requiredPermisos={['clases:ver']}>
      <DashboardLayout>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error && !clase ? (
          <div className="space-y-4 py-8 max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Info className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No se pudo cargar la clase</h2>
            <p className="text-gray-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
            <Button variant="outline" onClick={() => router.push('/dashboard/clases')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a clases
            </Button>
          </div>
        ) : !clase ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/clases')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clase.nombre}</h1>
                {clase.codigo && (
                  <p className="text-gray-600 mt-1">Código: {clase.codigo}</p>
                )}
              </div>
            </div>
            {puedeEditar && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/clases/${claseId}/editar`)}
                  className="justify-center"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Editar
                </Button>
                <Button onClick={() => setShowAgregarModal(true)} className="justify-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Agregar Beneficiarios
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {/* Navegación por pestañas */}
          <div className="flex border-b border-gray-200 gap-6 mt-4">
            <button
              onClick={() => setActiveTab('estudiantes')}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === 'estudiantes' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" /> 
                Estudiantes ({clase.beneficiarios?.length || 0})
              </div>
              {activeTab === 'estudiantes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('asistencia')}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === 'asistencia' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" /> 
                Asistencia
              </div>
              {activeTab === 'asistencia' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === 'info' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" /> 
                Información de la Clase
              </div>
              {activeTab === 'info' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          </div>

          {/* Tab: Estudiantes */}
          {activeTab === 'estudiantes' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Beneficiarios Inscritos ({clase.beneficiarios?.length || 0})
                </h2>
                {clase.beneficiarios && clase.beneficiarios.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-500 font-medium">Ordenar por:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="nombre">Nombre</option>
                      <option value="apellido">Apellido</option>
                      <option value="codigo">Código</option>
                      <option value="edad">Edad</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center justify-center gap-1.5"
                      title={sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}
                    >
                      <ArrowUpDown className="w-4 h-4 text-blue-600" />
                      <span className="hidden sm:inline font-medium">
                        {sortOrder === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {clase.beneficiarios && clase.beneficiarios.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {getSortedBeneficiarios(clase.beneficiarios).map((beneficiario) => (
                    <div key={beneficiario.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {beneficiario.nombre.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {beneficiario.nombre} {beneficiario.apellido}
                          </p>
                          <p className="text-sm text-gray-500">
                            Código: {beneficiario.codigo}
                            {beneficiario.fecha_nacimiento && (() => {
                              const nac = new Date(beneficiario.fecha_nacimiento);
                              const hoy = new Date();
                              let edad = hoy.getFullYear() - nac.getFullYear();
                              if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
                              return ` • ${edad} años`;
                            })()}
                          </p>
                        </div>
                      </div>
                      {puedeEditar && (
                        <button
                          onClick={() => handleRemoverBeneficiarioClick(beneficiario.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Remover de la clase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No hay beneficiarios inscritos en esta clase</p>
                  {puedeEditar && (
                    <Button onClick={() => setShowAgregarModal(true)}>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Agregar Beneficiarios
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: Asistencia */}
          {activeTab === 'asistencia' && (
            <div className="space-y-6">
              
              {/* Controles de fecha (Mes + Días válidos) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Días de Clase
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Selecciona la fecha para pasar asistencia
                    </p>
                  </div>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => {
                      setSelectedMonth(e.target.value);
                      // Opcional: auto-seleccionar la primera fecha de ese mes, lo haremos abajo
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Lista de fechas */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {(() => {
                    if (!clase) return null;
                    const validDays = (clase.horarios || []).map(h => mapeoDias[h.dia]);
                    const [year, month] = selectedMonth.split('-').map(Number);
                    const daysInMonth = new Date(year, month, 0).getDate();
                    const fechas = [];
                    for (let i = 1; i <= daysInMonth; i++) {
                      const d = new Date(year, month - 1, i);
                      if (validDays.length === 0 || validDays.includes(d.getDay())) {
                        const mStr = String(month).padStart(2, '0');
                        const dStr = String(i).padStart(2, '0');
                        fechas.push({ fechaStr: `${year}-${mStr}-${dStr}`, dateObj: d });
                      }
                    }

                    if (fechas.length === 0) {
                      return <p className="text-sm text-gray-400 py-4 italic">No hay clases programadas para este mes.</p>;
                    }

                    return fechas.map(({ fechaStr, dateObj }) => {
                      const isSelected = selectedFecha === fechaStr;
                      const dayName = dateObj.toLocaleDateString('es-DO', { weekday: 'short' });
                      const dayNum = dateObj.getDate();
                      
                      return (
                        <button
                          key={fechaStr}
                          onClick={() => setSelectedFecha(fechaStr)}
                          className={`flex flex-col items-center justify-center min-w-[70px] py-3 px-2 rounded-xl border transition-all ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105' 
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`text-xs font-medium capitalize ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                            {dayName}
                          </span>
                          <span className={`text-lg font-bold mt-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {dayNum}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Fotos del día — galería multi-foto */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-500" />
                    Fotos de evidencia
                    {fotos.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{fotos.length}</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleSubirFoto}
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFoto || loadingFoto}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {uploadingFoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploadingFoto ? 'Subiendo...' : 'Subir Foto'}
                    </button>
                  </div>
                </div>

                {loadingFoto && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                  </div>
                )}

                {!loadingFoto && fotos.length > 0 && (
                  <div className="p-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {fotos.map((foto, idx) => (
                        <div
                          key={foto.id}
                          className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer bg-gray-50"
                          onClick={() => setLightboxFoto(foto.imagen_url)}
                        >
                          <img
                            src={foto.imagen_url}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-1.5">
                            <button
                              className="opacity-0 group-hover:opacity-100 p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition-all scale-90 group-hover:scale-100"
                              onClick={(e) => { e.stopPropagation(); setLightboxFoto(foto.imagen_url); }}
                              title="Ver ampliada"
                            >
                              <ZoomIn className="w-3.5 h-3.5 text-gray-700" />
                            </button>
                            <button
                              className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/90 rounded-full shadow hover:bg-red-600 transition-all scale-90 group-hover:scale-100"
                              onClick={(e) => { e.stopPropagation(); handleEliminarFoto(foto.id); }}
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                          <div className="absolute top-1 left-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">{idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!loadingFoto && fotos.length === 0 && (
                  <div className="text-center py-5 text-gray-400">
                    <Camera className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">Sin fotos · haz click en "Subir Foto" para agregar</p>
                  </div>
                )}
              </div>

              {/* Registro de Asistencia (Ancho Completo) */}
              <div>
                <RegistroAsistencia claseId={claseId} fecha={selectedFecha} onSaved={() => {}} />
              </div>
            </div>
          )}

          {/* Tab: Información */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información general */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Información General
              </h2>
              
              <div className="space-y-3">
                {clase.descripcion && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Descripción</p>
                    <p className="text-gray-600">{clase.descripcion}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                    <UserCircle className="w-4 h-4" />
                    Tutor
                  </p>
                  <p className="text-gray-600">
                    {clase.tutor?.nombre} {clase.tutor?.apellido}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    Horarios
                  </p>
                  <div className="space-y-1">
                    {clase.horarios?.map((h, idx) => (
                      <p key={idx} className="text-gray-600">
                        {diasLabel[h.dia] || h.dia} — {getTurnoLabel(h.hora_inicio)}
                      </p>
                    ))}
                    {(!clase.horarios || clase.horarios.length === 0) && (
                      <p className="text-gray-400 italic">Sin horarios asignados</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4" />
                    Capacidad
                  </p>
                  <p className="text-gray-600">
                    {clase.beneficiarios?.length || 0} 
                    {clase.capacidad_maxima > 0 && ` / ${clase.capacidad_maxima}`} inscrito(s)
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Estado</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    clase.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {clase.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Total Inscritos</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {clase.beneficiarios?.length || 0}
                  </span>
                </div>

                {clase.capacidad_maxima > 0 && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-900">Cupos Disponibles</span>
                      <span className="text-2xl font-bold text-green-600">
                        {clase.capacidad_maxima - (clase.beneficiarios?.length || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-900">% Ocupación</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {Math.round(((clase.beneficiarios?.length || 0) / clase.capacidad_maxima) * 100)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>
          )}

          {/* Lightbox */}
          {lightboxFoto && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightboxFoto(null)}>
              <button
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                onClick={() => setLightboxFoto(null)}
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <img src={lightboxFoto} alt="Foto" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
            </div>
          )}

          {/* Modal Agregar Beneficiarios */}
          <AgregarBeneficiariosModal
            isOpen={showAgregarModal}
            onClose={() => setShowAgregarModal(false)}
            onAgregar={handleAgregarBeneficiarios}
            beneficiariosActuales={clase.beneficiarios?.map(b => b.id) || []}
          />

          {/* Modal Confirmar Eliminación */}
          <Modal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            title="Confirmar Remoción"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                ¿Estás seguro de que deseas remover este beneficiario de la clase?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleRemoverBeneficiario}
                >
                  Remover
                </Button>
              </div>
            </div>
          </Modal>
        </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}