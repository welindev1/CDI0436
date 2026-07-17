'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { TipoDocumentoUsuario } from '@/lib/api/documentos-usuario';
import { Upload, FileText } from 'lucide-react';

interface SubirDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  tiposDocumento: { value: string; label: string }[];
  tipoPreseleccionado?: TipoDocumentoUsuario;
}

export default function SubirDocumentoModal({
  isOpen,
  onClose,
  onSubmit,
  tiposDocumento,
  tipoPreseleccionado,
}: SubirDocumentoModalProps) {
  const currentYear = new Date().getFullYear();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tipo, setTipo] = useState<TipoDocumentoUsuario>(
    tipoPreseleccionado || TipoDocumentoUsuario.OTRO
  );
  const [anio, setAnio] = useState(currentYear);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTipo(tipoPreseleccionado || TipoDocumentoUsuario.OTRO);
      setAnio(currentYear);
      setArchivo(null);
      setNotas('');
      setError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen, tipoPreseleccionado, currentYear]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) {
      setError('Debe seleccionar un archivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('tipo_documento', tipo);
      formData.append('anio', String(anio));
      if (notas) formData.append('notas', notas);

      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subir Documento" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de documento
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoDocumentoUsuario)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {tiposDocumento.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            min={2000}
            max={2100}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
          <div
            className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
              required
            />
            {archivo ? (
              <>
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{archivo.name}</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500">
                  Seleccionar archivo (PDF, JPG, PNG)
                </span>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading} className="bg-teal-600 hover:bg-teal-700">
            <Upload className="w-4 h-4 mr-1" />
            Subir Documento
          </Button>
        </div>
      </form>
    </Modal>
  );
}
