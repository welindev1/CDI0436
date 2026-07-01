'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Upload, Trash2, Loader2, ZoomIn, X } from 'lucide-react';
import { useFotosAsistencia, useSubirFotoAsistencia, useEliminarFotoAsistencia } from '@/lib/hooks';
import type { FotoAsistencia } from '@/lib/types';

interface GestionFotosProps {
  claseId: string;
  fecha: string;
}

export default function GestionFotos({ claseId, fecha }: GestionFotosProps) {
  const { data: fotosRaw, isLoading: loadingFoto } = useFotosAsistencia(claseId, fecha);
  const subirFoto = useSubirFotoAsistencia();
  const eliminarFoto = useEliminarFotoAsistencia();

  const [lightboxFoto, setLightboxFoto] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fotos: FotoAsistencia[] = Array.isArray(fotosRaw) ? fotosRaw : fotosRaw ? [fotosRaw] : [];

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
        await subirFoto.mutateAsync({ claseId, fecha, imagenBase64: base64 });
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      console.error('Error al subir foto:', err);
      alert(axiosErr.response?.data?.message || 'Error al subir la foto');
    } finally {
      setUploadingFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEliminarFoto = async (fotoId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return;
    try {
      await eliminarFoto.mutateAsync(fotoId);
    } catch (err: unknown) {
      console.error('Error al eliminar foto:', err);
      alert('Error al eliminar la foto');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-500" />
          Fotos del día
          {fotos.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {fotos.length}
            </span>
          )}
        </h3>

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
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {uploadingFoto ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Subir Foto
            </>
          )}
        </button>
      </div>

      {loadingFoto && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {!loadingFoto && fotos.length > 0 && (
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {fotos.map((foto: FotoAsistencia, idx: number) => (
              <div
                key={foto.id}
                className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer bg-gray-50"
                onClick={() => setLightboxFoto(foto.imagen_url)}
              >
                <Image
                  src={foto.imagen_url}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  width={400}
                  height={400}
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2">
                  <button
                    className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all duration-200 scale-90 group-hover:scale-100"
                    onClick={(e) => { e.stopPropagation(); setLightboxFoto(foto.imagen_url); }}
                    title="Ver ampliada"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/90 rounded-full shadow-lg hover:bg-red-600 transition-all duration-200 scale-90 group-hover:scale-100"
                    onClick={(e) => { e.stopPropagation(); handleEliminarFoto(foto.id); }}
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loadingFoto && fotos.length === 0 && !uploadingFoto && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl mx-5 mb-5">
          <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No hay fotos para esta fecha</p>
          <p className="text-xs text-gray-400 mt-1">Haz click en &quot;Subir Foto&quot; para agregar una o varias</p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxFoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxFoto(null)}
        >
          <button
            onClick={() => setLightboxFoto(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <Image
            src={lightboxFoto}
            alt="Foto de asistencia"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            width={1200}
            height={900}
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
