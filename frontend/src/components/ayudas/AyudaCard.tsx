'use client';

import { Phone, Image as ImageIcon, MessageSquare, CheckCircle, XCircle, Trash2, ImagePlus, Upload } from 'lucide-react';
import type { Ayuda } from '@/lib/types';

interface AyudaCardProps {
  ayuda: Ayuda;
  onViewFoto: (url: string) => void;
  onOpenComentarios: (ayuda: Ayuda) => void;
  onUploadFotoEntrega: (ayuda: Ayuda) => void;
  onViewFotoEntrega: (url: string) => void;
  onAprobar: (id: string) => void;
  onRechazar: (id: string) => void;
  onDelete: (id: string) => void;
  onDetalleHover: (info: { id: string; x: number; y: number } | null) => void;
}

export function AyudaCard({
  ayuda,
  onViewFoto,
  onOpenComentarios,
  onUploadFotoEntrega,
  onViewFotoEntrega,
  onAprobar,
  onRechazar,
  onDelete,
  onDetalleHover,
}: AyudaCardProps) {
  const tipoLabel = {
    medica: 'Médica',
    alimentos: 'Alimentos',
    pequeno_negocio: 'Peq. Negocio',
    educacion: 'Educación',
    otros: ayuda.tipo_especificacion ? `Otros: ${ayuda.tipo_especificacion}` : 'Otros',
  };

  const tipoColors: Record<string, string> = {
    medica: 'bg-red-100 text-red-800',
    alimentos: 'bg-green-100 text-green-800',
    pequeno_negocio: 'bg-purple-100 text-purple-800',
    educacion: 'bg-blue-100 text-blue-800',
  };

  const estadoBadge = {
    aprobada: 'bg-green-100 text-green-800',
    rechazada: 'bg-red-100 text-red-800',
    pendiente: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <tr key={ayuda.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {ayuda.codigo_beneficiario}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="font-medium text-gray-900">{ayuda.nombre_beneficiario}</div>
        <div className="text-xs text-gray-500">Profesor: {ayuda.nombre_tutor}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {ayuda.telefono ? (
          <a
            href={`https://wa.me/${ayuda.telefono.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-green-600 hover:text-green-800 transition"
            title="Abrir WhatsApp"
          >
            <Phone className="w-4 h-4" />
            {ayuda.telefono}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tipoColors[ayuda.tipo] || 'bg-gray-100 text-gray-800'}`}>
          {tipoLabel[ayuda.tipo] || 'Otros'}
        </span>
        {ayuda.foto_url && (
          <button
            onClick={() => onViewFoto(ayuda.foto_url!)}
            className="ml-2 text-blue-600 hover:text-blue-800"
            title="Ver foto"
          >
            <ImageIcon className="w-4 h-4 inline" />
          </button>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs relative">
        <div
          className="truncate cursor-pointer hover:text-blue-600"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onDetalleHover({ id: ayuda.id, x: rect.left, y: rect.bottom });
          }}
          onMouseLeave={() => onDetalleHover(null)}
        >
          {ayuda.detalle}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoBadge[ayuda.estado]}`}>
          {ayuda.estado.charAt(0).toUpperCase() + ayuda.estado.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(ayuda.creado_en).toLocaleDateString('es-DO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenComentarios(ayuda)}
            title="Ver comentarios"
            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          {(ayuda.estado === 'pendiente' || ayuda.estado === 'aprobada') && (
            <>
              {ayuda.foto_entrega_url ? (
                <button
                  onClick={() => onViewFotoEntrega(ayuda.foto_entrega_url!)}
                  title="Ver foto de entrega"
                  className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 p-2 rounded-full hover:bg-emerald-100 transition"
                >
                  <ImagePlus className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => onUploadFotoEntrega(ayuda)}
                  title="Subir foto de entrega"
                  className="text-orange-600 hover:text-orange-900 bg-orange-50 p-2 rounded-full hover:bg-orange-100 transition"
                >
                  <Upload className="w-5 h-5" />
                </button>
              )}
            </>
          )}
          {ayuda.estado === 'pendiente' && (
            <>
              <button
                onClick={() => onAprobar(ayuda.id)}
                title="Aprobar"
                className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full hover:bg-green-100 transition"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => onRechazar(ayuda.id)}
                title="Rechazar"
                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(ayuda.id)}
            title="Eliminar"
            className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
