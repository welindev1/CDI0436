'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ClaseFechaSelector from '@/components/asistencias/ClaseFechaSelector';
import RegistroAsistencia from '@/components/asistencias/RegistroAsistencia';
import { asistenciasApi } from '@/lib/api/asistencias';
import { ClipboardCheck, Camera, X, Upload, Trash2, Loader2 } from 'lucide-react';

export default function AsistenciasPage() {
  const [selectedClase, setSelectedClase] = useState<string | null>(null);
  const [selectedFecha, setSelectedFecha] = useState<string | null>(null);
  const [foto, setFoto] = useState<any>(null);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (claseId: string, fecha: string) => {
    setSelectedClase(claseId);
    setSelectedFecha(fecha);
  };

  // Cargar foto cuando se selecciona clase y fecha
  useEffect(() => {
    if (selectedClase && selectedFecha) {
      cargarFoto();
    } else {
      setFoto(null);
    }
  }, [selectedClase, selectedFecha]);

  const cargarFoto = async () => {
    if (!selectedClase || !selectedFecha) return;

    try {
      setLoadingFoto(true);
      const data = await asistenciasApi.getFoto(selectedClase, selectedFecha);
      setFoto(data);
    } catch (err: any) {
      // Si es 404, no hay foto (es normal)
      if (err.response?.status !== 404) {
        console.error('Error al cargar foto:', err);
      }
      setFoto(null);
    } finally {
      setLoadingFoto(false);
    }
  };

  const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClase || !selectedFecha) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede ser mayor a 5MB');
      return;
    }

    try {
      setUploadingFoto(true);

      // Convertir archivo a Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await asistenciasApi.subirFoto(selectedClase, selectedFecha, base64);
      await cargarFoto();
    } catch (err: any) {
      console.error('Error al subir foto:', err);
      alert(err.response?.data?.message || 'Error al subir la foto');
    } finally {
      setUploadingFoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEliminarFoto = async () => {
    if (!foto?.id || !confirm('¿Estás seguro de eliminar esta foto?')) return;

    try {
      setLoadingFoto(true);
      await asistenciasApi.eliminarFoto(foto.id);
      setFoto(null);
    } catch (err: any) {
      console.error('Error al eliminar foto:', err);
      alert('Error al eliminar la foto');
    } finally {
      setLoadingFoto(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="w-7 h-7 text-blue-600" />
                Registro de Asistencias
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Selecciona una clase y luego la fecha para registrar asistencia
              </p>
            </div>
          </div>

          {/* Selector de clase y fecha */}
          <ClaseFechaSelector
            onSelect={handleSelect}
            initialClaseId={selectedClase || undefined}
            initialFecha={selectedFecha || undefined}
          />

          {/* Sección de foto */}
          {selectedClase && selectedFecha && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-500" />
                  Foto del día
                </h3>

                {/* Input oculto para subir archivo */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSubirFoto}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                {!foto && !loadingFoto && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFoto}
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
                )}
              </div>

              {/* Loading state */}
              {loadingFoto && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}

              {/* Preview de la foto */}
              {foto && !loadingFoto && (
                <div className="relative group mx-5 my-4">
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-xl border border-gray-200"
                    onClick={() => setShowLightbox(true)}
                  >
                    <img
                      src={foto.imagen_url}
                      alt="Foto de asistencia"
                      className="w-full max-h-48 object-cover hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-3 py-1 rounded-full text-sm transition-opacity">
                        Click para ampliar
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      disabled={uploadingFoto}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      title="Cambiar foto"
                    >
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEliminarFoto(); }}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay foto */}
              {!foto && !loadingFoto && !uploadingFoto && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl mx-5 mb-5">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No hay foto para esta fecha</p>
                  <p className="text-xs text-gray-400 mt-1">Haz click en "Subir Foto" para agregar una</p>
                </div>
              )}
            </div>
          )}

          {/* Registro de asistencia */}
          {selectedClase && selectedFecha && (
            <RegistroAsistencia
              claseId={selectedClase}
              fecha={selectedFecha}
              onSaved={() => {
                // Opcional: recargar o mostrar mensaje
              }}
            />
          )}

          {/* Estado vacío */}
          {!selectedClase && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Selecciona una clase</h3>
              <p className="text-gray-400 text-sm">Elige la clase y la fecha para comenzar el registro de asistencia</p>
            </div>
          )}
        </div>

        {/* Lightbox para ver imagen completa */}
        {showLightbox && foto && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <img
              src={foto.imagen_url}
              alt="Foto de asistencia"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
