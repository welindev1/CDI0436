'use client';

import { Folder, Eye, Trash2, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import { TipoDocumentoUsuario, type DocumentoUsuario } from '@/lib/api/documentos-usuario';

const tipoLabels: Record<TipoDocumentoUsuario, string> = {
  [TipoDocumentoUsuario.FIRMA]: 'Firma del Compromiso',
  [TipoDocumentoUsuario.ANTECEDENTES_PENALES]: 'Antecedentes Penales',
  [TipoDocumentoUsuario.EXAMEN_PROTECCION]: 'Examen de Protección',
  [TipoDocumentoUsuario.VACACIONES]: 'Vacaciones',
  [TipoDocumentoUsuario.LICENCIAS]: 'Licencias',
  [TipoDocumentoUsuario.SUSPENSION]: 'Suspensión',
  [TipoDocumentoUsuario.AMONESTACION]: 'Amonestación',
  [TipoDocumentoUsuario.OTRO]: 'Otro',
};

interface DocumentoCarpetaProps {
  tipo: TipoDocumentoUsuario;
  documentos: DocumentoUsuario[];
  onSubir: (tipo: TipoDocumentoUsuario) => void;
  onEliminar: (doc: DocumentoUsuario) => void;
}

export default function DocumentoCarpeta({
  tipo,
  documentos,
  onSubir,
  onEliminar,
}: DocumentoCarpetaProps) {
  const sortedDocs = [...documentos].sort((a, b) => b.anio - a.anio);

  return (
    <div className="bg-white rounded-lg shadow border-l-4 border-amber-400 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Folder className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900">{tipoLabels[tipo]}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {documentos.length}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSubir(tipo)}
          className="flex items-center gap-1"
        >
          <Upload className="w-3 h-3" />
          Subir
        </Button>
      </div>

      <div className="p-4">
        {sortedDocs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Sin documentos</p>
        ) : (
          <div className="space-y-3">
            {sortedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 flex-shrink-0">
                    {doc.anio}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.nombre_original}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.creado_en).toLocaleDateString('es-DO')}
                      {doc.subido_por && ` · ${doc.subido_por.nombre}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}${doc.archivo_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Ver documento"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onEliminar(doc)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
