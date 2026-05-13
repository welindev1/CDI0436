'use client';

import { useState, useRef } from 'react';
import { X, ImagePlus, Images } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ImagenGaleria {
  base64: string;
  titulo?: string;
  descripcion?: string;
}

interface EditarExpedienteModalProps {
  isOpen: boolean;
  entrada: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const COLORES = [
  { value: 'azul',     label: 'Azul',     bg: 'bg-blue-500' },
  { value: 'verde',    label: 'Verde',    bg: 'bg-green-500' },
  { value: 'rojo',     label: 'Rojo',     bg: 'bg-red-500' },
  { value: 'amarillo', label: 'Amarillo', bg: 'bg-yellow-400' },
  { value: 'morado',   label: 'Morado',   bg: 'bg-purple-500' },
  { value: 'gris',     label: 'Gris',     bg: 'bg-gray-400' },
];

const compressImage = (file: File, maxWidth = 800): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

export default function EditarExpedienteModal({ isOpen, entrada, onClose, onSave }: EditarExpedienteModalProps) {
  const [titulo, setTitulo] = useState('');
  const [mostrarTitulo, setMostrarTitulo] = useState(true);
  const [contenido, setContenido] = useState('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [etiquetaColor, setEtiquetaColor] = useState('azul');
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [imagenesGaleria, setImagenesGaleria] = useState<ImagenGaleria[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);

  // Sync state when entrada changes (modal opens)
  const prevEntradaId = useRef<string | null>(null);
  if (entrada && entrada.id !== prevEntradaId.current) {
    prevEntradaId.current = entrada.id;
    setTitulo(entrada.titulo || '');
    setMostrarTitulo(entrada.mostrar_titulo ?? true);
    setContenido(entrada.contenido || '');
    setFechaEvento(entrada.fecha_evento ? entrada.fecha_evento.split('T')[0] : '');
    setEtiquetaColor(entrada.etiqueta_color || 'azul');
    setImagenBase64(entrada.imagen_base64 || null);
    setImagenesGaleria(entrada.imagenes_galeria || []);
  }

  if (!entrada) return null;

  const isGaleria = entrada.tipo === 'galeria';

  const handleImagenPrincipal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagenBase64(await compressImage(file));
  };

  const handleAgregarGaleria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const nuevas = await Promise.all(files.map(async (f) => ({ base64: await compressImage(f) })));
    setImagenesGaleria(prev => [...prev, ...nuevas]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        titulo: titulo || null,
        mostrar_titulo: mostrarTitulo,
        contenido: contenido || null,
        fecha_evento: fechaEvento || null,
        etiqueta_color: etiquetaColor,
        imagen_base64: isGaleria ? null : imagenBase64,
        imagenes_galeria: isGaleria ? imagenesGaleria : null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Entrada" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Título */}
        <div>
          {isGaleria ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Galería</label>
              <div className="flex items-center gap-3">
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Título de la galería..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={mostrarTitulo}
                    onChange={e => setMostrarTitulo(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  Mostrar título
                </label>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Título del registro..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Evento</label>
                <input
                  type="date"
                  value={fechaEvento}
                  onChange={e => setFechaEvento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            rows={isGaleria ? 2 : 4}
            placeholder="Descripción o detalles..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        {/* Imagen principal (registros) */}
        {!isGaleria && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen adjunta</label>
            {imagenBase64 ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagenBase64} alt="Preview" className="w-full max-h-48 object-cover" />
                <button type="button" onClick={() => setImagenBase64(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <ImagePlus className="w-7 h-7 text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">Clic para subir imagen</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagenPrincipal} />
          </div>
        )}

        {/* Galería de imágenes */}
        {isGaleria && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imágenes ({imagenesGaleria.length} en la galería)
            </label>
            {imagenesGaleria.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {imagenesGaleria.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.base64} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => setImagenesGaleria(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div onClick={() => galeriaRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Images className="w-7 h-7 text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">Agregar más imágenes</span>
            </div>
            <input ref={galeriaRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAgregarGaleria} />
          </div>
        )}

        {/* Etiqueta de color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Etiqueta de color</label>
          <div className="flex gap-2">
            {COLORES.map(c => (
              <button key={c.value} type="button" title={c.label}
                onClick={() => setEtiquetaColor(c.value)}
                className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${etiquetaColor === c.value ? 'ring-2 ring-offset-2 ring-gray-600 scale-110' : 'hover:scale-110'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving} className="bg-blue-600 text-white">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
