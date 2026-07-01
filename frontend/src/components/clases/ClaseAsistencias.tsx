'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar, Camera, Upload, Loader2, ZoomIn, Trash2, X,
} from 'lucide-react';
import RegistroAsistencia from '@/components/asistencias/RegistroAsistencia';
import type { Clase, FotoAsistencia } from '@/lib/types';
import { asistenciasApi } from '@/lib/api/asistencias';
import { generarFechasDelMes } from '@/lib/utils/formatters';

interface ClaseAsistenciasProps {
  clase: Clase;
  claseId: string;
}

export default function ClaseAsistencias({ clase, claseId }: ClaseAsistenciasProps) {
  const [selectedFecha, setSelectedFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [fotos, setFotos] = useState<FotoAsistencia[]>([]);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [lightboxFoto, setLightboxFoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fechasDelMes = useMemo(
    () => generarFechasDelMes(clase.horarios, selectedMonth),
    [clase, selectedMonth]
  );

  // Auto-select a valid date when month changes
  useEffect(() => {
    if (fechasDelMes.length > 0 && !fechasDelMes.includes(selectedFecha)) {
      const hoyStr = new Date().toISOString().split('T')[0];
      if (hoyStr.startsWith(selectedMonth)) {
        let idx = fechasDelMes.findIndex(f => f >= hoyStr);
        if (idx === -1) idx = fechasDelMes.length - 1;
        setSelectedFecha(fechasDelMes[idx]);
      } else {
        setSelectedFecha(fechasDelMes[0]);
      }
    }
  }, [fechasDelMes, selectedFecha, selectedMonth]);

  // Cargar fotos
  useEffect(() => {
    cargarFotos();
  }, [selectedFecha]);

  const cargarFotos = async () => {
    try {
      setLoadingFoto(true);
      const data = await asistenciasApi.getFoto(claseId, selectedFecha);
      setFotos(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status !== 404) console.error('Error al cargar fotos:', err);
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
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al subir la foto');
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
    } catch {
      alert('Error al eliminar la foto');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de fecha */}
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
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {fechasDelMes.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 italic">No hay clases programadas para este mes.</p>
          ) : (
            fechasDelMes.map((fechaStr) => {
              const dateObj = new Date(fechaStr + 'T12:00:00');
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
            })
          )}
        </div>
      </div>

      {/* Galería de fotos */}
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
            <p className="text-xs">Sin fotos · haz click en &quot;Subir Foto&quot; para agregar</p>
          </div>
        )}
      </div>

      {/* Registro de Asistencia */}
      <div>
        <RegistroAsistencia claseId={claseId} fecha={selectedFecha} onSaved={() => {}} />
      </div>

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
    </div>
  );
}
