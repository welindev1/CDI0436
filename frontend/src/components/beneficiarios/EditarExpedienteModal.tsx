'use client';

import { useState, useRef } from 'react';
import { X, Images, FilePlus, GraduationCap, FileText, FileArchive } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ImagenGaleria {
  base64: string;
  titulo?: string;
  descripcion?: string;
}

interface PdfAdjunto {
  nombre: string;
  base64_pdf: string;
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

const compressImage = (file: File, maxWidth = 900): Promise<string> =>
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
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

const readPdfAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
  });

const TIPO_ICONS: Record<string, any> = {
  educativo: GraduationCap,
  registro: FileText,
  documentos: FileArchive,
  otros: FileText,
  galeria: Images,
  libre: FileText,
};

const TIPO_LABELS: Record<string, string> = {
  educativo: 'Educativo',
  registro: 'Registro',
  documentos: 'Documentos',
  otros: 'Otros',
  galeria: 'Galería',
  libre: 'Libre',
};

export default function EditarExpedienteModal({ isOpen, entrada, onClose, onSave }: EditarExpedienteModalProps) {
  const [titulo, setTitulo] = useState('');
  const [mostrarTitulo, setMostrarTitulo] = useState(true);
  const [contenido, setContenido] = useState('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [etiquetaColor, setEtiquetaColor] = useState('azul');
  const [imagenesGaleria, setImagenesGaleria] = useState<ImagenGaleria[]>([]);
  const [pdfs, setPdfs] = useState<PdfAdjunto[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const galeriaRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  // Sync state when entrada changes (modal opens)
  const prevEntradaId = useRef<string | null>(null);
  if (entrada && entrada.id !== prevEntradaId.current) {
    prevEntradaId.current = entrada.id;
    setTitulo(entrada.titulo || '');
    setMostrarTitulo(entrada.mostrar_titulo ?? true);
    setContenido(entrada.contenido || '');
    setFechaEvento(entrada.fecha_evento ? entrada.fecha_evento.split('T')[0] : '');
    setEtiquetaColor(entrada.etiqueta_color || 'azul');
    // Support both new multi-image and legacy single-image
    const imgs = entrada.imagenes_galeria || (entrada.imagen_base64 ? [{ base64: entrada.imagen_base64 }] : []);
    setImagenesGaleria(imgs);
    setPdfs(entrada.pdfs || []);
  }

  if (!entrada) return null;

  const tipo = entrada.tipo as string;
  const showFecha = tipo !== 'documentos' && tipo !== 'otros';
  const TipoIcon = TIPO_ICONS[tipo] || FileText;
  const tipoLabel = TIPO_LABELS[tipo] || tipo;

  const handleAgregarImagenes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const nuevas = await Promise.all(files.map(async (f) => ({ base64: await compressImage(f) })));
    setImagenesGaleria(prev => [...prev, ...nuevas]);
    e.target.value = '';
  };

  const handleAgregarPdfs = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const nuevos = await Promise.all(files.map(async (f) => ({
      nombre: f.name,
      base64_pdf: await readPdfAsBase64(f),
    })));
    setPdfs(prev => [...prev, ...nuevos]);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        titulo: titulo || null,
        mostrar_titulo: mostrarTitulo,
        contenido: contenido || null,
        fecha_evento: (showFecha && fechaEvento) ? fechaEvento : null,
        etiqueta_color: etiquetaColor,
        imagen_base64: null,
        imagenes_galeria: imagenesGaleria.length > 0 ? imagenesGaleria : null,
        pdfs: pdfs.length > 0 ? pdfs : null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Entrada" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Tipo badge */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <TipoIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Categoría: <strong>{tipoLabel}</strong></span>
        </div>

        {/* Título */}
        <div className={`grid gap-3 ${showFecha ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            {tipo === 'educativo' ? (
              <div className="flex items-center gap-3">
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Título..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={mostrarTitulo}
                    onChange={e => setMostrarTitulo(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  Mostrar
                </label>
              </div>
            ) : (
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Título..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            )}
          </div>

          {showFecha && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Evento</label>
              <input
                type="date"
                value={fechaEvento}
                onChange={e => setFechaEvento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            rows={3}
            placeholder="Descripción o detalles..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes ({imagenesGaleria.length} {imagenesGaleria.length === 1 ? 'foto' : 'fotos'})
          </label>
          {imagenesGaleria.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {imagenesGaleria.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.base64} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagenesGaleria(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div
            onClick={() => galeriaRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Images className="w-7 h-7 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">
              {imagenesGaleria.length === 0 ? 'Agregar imágenes' : 'Agregar más imágenes'}
            </span>
          </div>
          <input ref={galeriaRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAgregarImagenes} />
        </div>

        {/* PDFs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDFs adjuntos ({pdfs.length} {pdfs.length === 1 ? 'archivo' : 'archivos'})
          </label>
          {pdfs.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {pdfs.map((pdf, i) => (
                <div key={i} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FilePlus className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700 font-medium truncate max-w-xs">{pdf.nombre}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPdfs(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div
            onClick={() => pdfRef.current?.click()}
            className="border-2 border-dashed border-red-200 rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors"
          >
            <FilePlus className="w-6 h-6 text-red-400 mb-1" />
            <span className="text-sm text-gray-500">
              {pdfs.length === 0 ? 'Adjuntar PDFs' : 'Agregar más PDFs'}
            </span>
          </div>
          <input ref={pdfRef} type="file" accept="application/pdf" multiple className="hidden" onChange={handleAgregarPdfs} />
        </div>

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
