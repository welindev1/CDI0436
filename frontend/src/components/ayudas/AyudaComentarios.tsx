'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import type { Ayuda, ComentarioAyuda } from '@/lib/types';

interface AyudaComentariosProps {
  ayuda: Ayuda | null;
  comentarios: ComentarioAyuda[];
  loading: boolean;
  onAddComentario: (contenido: string) => void;
  onClose: () => void;
}

export function AyudaComentarios({
  ayuda,
  comentarios,
  loading,
  onAddComentario,
}: AyudaComentariosProps) {
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [comentarioHover, setComentarioHover] = useState<{ id: string; x: number; y: number } | null>(null);

  const handleSubmit = () => {
    if (!nuevoComentario.trim()) return;
    onAddComentario(nuevoComentario);
    setNuevoComentario('');
  };

  return (
    <>
      <div className="space-y-4">
        {/* Agregar nuevo comentario */}
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={!nuevoComentario.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de comentarios */}
        <div className="max-h-80 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando comentarios...</div>
          ) : comentarios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay comentarios aún</div>
          ) : (
            comentarios.map((comentario) => (
              <div
                key={comentario.id}
                className="bg-gray-50 rounded-lg p-3 relative"
                onMouseEnter={(e) => {
                  if (comentario.contenido.length > 100) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setComentarioHover({ id: comentario.id, x: rect.left, y: rect.bottom });
                  }
                }}
                onMouseLeave={() => setComentarioHover(null)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-gray-900">{comentario.autor}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comentario.creado_en).toLocaleString('es-DO')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comentario.contenido.length > 100
                    ? comentario.contenido.substring(0, 100) + '...'
                    : comentario.contenido}
                </p>
                {comentario.contenido.length > 100 && (
                  <span className="text-xs text-blue-600 cursor-pointer">Pasa el mouse para ver más</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tooltip para comentario largo */}
      {comentarioHover && (
        <div
          className="fixed z-[60] bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md text-sm"
          style={{
            left: Math.min(comentarioHover.x, window.innerWidth - 400),
            top: comentarioHover.y + 8,
          }}
        >
          <p className="whitespace-pre-wrap">
            {comentarios.find((c) => c.id === comentarioHover.id)?.contenido}
          </p>
        </div>
      )}
    </>
  );
}
