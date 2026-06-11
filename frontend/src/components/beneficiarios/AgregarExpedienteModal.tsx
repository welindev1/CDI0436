'use client';

import { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { X, ImagePlus, Images, FileText, GraduationCap, FilePlus, FileArchive } from 'lucide-react';

type TipoExpediente = 'educativo' | 'registro' | 'documentos';

interface ImagenGaleria {
  base64: string;
  titulo?: string;
  descripcion?: string;
}

interface PdfAdjunto {
  nombre: string;
  base64_pdf: string;
}

interface AgregarExpedienteModalProps {
  isOpen: boolean;
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

const TIPOS: { value: TipoExpediente; icon: any; label: string; desc: string; color: string }[] = [
  {
    value: 'educativo',
    icon: GraduationCap,
    label: 'Educativo',
    desc: 'Fotos y registro académico',
    color: 'blue',
  },
  {
    value: 'registro',
    icon: FileText,
    label: 'Registro',
    desc: 'Nota, texto y varias fotos',
    color: 'emerald',
  },
  {
    value: 'documentos',
    icon: FileArchive,
    label: 'Documentos',
    desc: 'Archivos, PDFs e imágenes',
    color: 'purple',
  },
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

export default function AgregarExpedienteModal({ isOpen, onClose, onSave }: AgregarExpedienteModalProps) {
  const [tipo, setTipo] = useState<TipoExpediente>('educativo');
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

  const reset = () => {
    setTipo('educativo');
    setTitulo('');
    setMostrarTitulo(true);
    setContenido('');
    setFechaEvento('');
    setEtiquetaColor('azul');
    setImagenesGaleria([]);
    setPdfs([]);
  };

  const handleClose = () => { reset(); onClose(); };

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
    if (!titulo.trim() && imagenesGaleria.length === 0 && pdfs.length === 0 && !contenido.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        tipo,
        titulo: titulo || null,
        mostrar_titulo: mostrarTitulo,
        contenido: contenido || null,
        fecha_evento: (tipo !== 'documentos' && fechaEvento) ? fechaEvento : null,
        etiqueta_color: etiquetaColor,
        imagen_base64: null,
        imagenes_galeria: imagenesGaleria.length > 0 ? imagenesGaleria : null,
        pdfs: pdfs.length > 0 ? pdfs : null,
      });
      reset();
    } finally {
      setIsSaving(false);
    }
  };

  const tipoActual = TIPOS.find(t => t.value === tipo)!;
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    purple: 'border-purple-500 bg-purple-50 text-purple-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar al Expediente" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Selector de Tipo */}
        <div className="grid grid-cols-3 gap-3">
          {TIPOS.map(({ value, icon: Icon, label, desc, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTipo(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center
                ${tipo === value ? colorMap[color] : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
            >
              <Icon className="w-6 h-6" />
              <span className="font-semibold text-sm">{label}</span>
              <span className="text-xs text-gray-500">{desc}</span>
            </button>
          ))}
        </div>

        <hr className="border-gray-100" />

        {/* ── CAMPOS COMUNES ── */}
        <div className={`grid gap-3 ${tipo !== 'documentos' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título {tipo !== 'documentos' ? '(opcional)' : '*'}
            </label>
            {tipo === 'educativo' ? (
              <div className="flex items-center gap-3">
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ej: Fotos del Campamento 2025..."
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
                placeholder={tipo === 'registro' ? 'Ej: Visita médica, Evento...' : 'Ej: Acta de nacimiento, Certificado...'}
                required={tipo === 'documentos'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            )}
          </div>

          {/* Fecha de evento — solo educativo y registro */}
          {tipo !== 'documentos' && (
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {tipo === 'documentos' ? 'Detalle (opcional)' : 'Descripción (opcional)'}
          </label>
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            rows={tipo === 'educativo' ? 2 : 3}
            placeholder={tipo === 'documentos' ? 'Información adicional sobre el documento...' : 'Escribe lo que necesites...'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        {/* ── IMÁGENES (los 3 tipos) ── */}
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
            className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Images className="w-7 h-7 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">
              {imagenesGaleria.length === 0 ? 'Clic para agregar imágenes' : 'Agregar más imágenes'}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">Puedes seleccionar varias a la vez</span>
          </div>
          <input ref={galeriaRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAgregarImagenes} />
        </div>

        {/* ── PDFs ── */}
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
              {pdfs.length === 0 ? 'Clic para adjuntar PDFs' : 'Agregar más PDFs'}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">Puedes seleccionar varios a la vez</span>
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
          <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving} className="bg-blue-600 text-white">
            Guardar en Expediente
          </Button>
        </div>
      </form>
    </Modal>
  );
}
