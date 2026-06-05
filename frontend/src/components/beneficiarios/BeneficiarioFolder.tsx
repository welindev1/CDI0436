import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Beneficiario } from '@/lib/types';

interface BeneficiarioFolderProps {
  beneficiario: Beneficiario;
}

export default function BeneficiarioFolder({ beneficiario }: BeneficiarioFolderProps) {
  const { tienePermiso } = useAuth();
  const nombreCompleto = `${beneficiario.nombre} ${beneficiario.apellido || ''}`.trim();
  const nombreTruncado = nombreCompleto.length > 15 ? nombreCompleto.substring(0, 15) + '...' : nombreCompleto;

  // Si quieres forzar una foto para probar el diseño de Windows, puedes descomentar la línea de abajo:
  // const fotoUrl = beneficiario.foto_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const fotoUrl = beneficiario.foto_url;

  return (
    <Link 
      href={`/dashboard/beneficiarios/${beneficiario.id}`}
      className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
      title={nombreCompleto}
    >
      <div className="relative w-28 h-24 transition-transform duration-200 ease-in-out group-hover:scale-105 rounded-lg">
        {/* Pestaña superior (Tab) de la carpeta */}
        <div className="absolute top-0 left-0 w-11 h-4 bg-amber-500 rounded-t-md z-0" />
        
        {/* Cara TRASERA de la carpeta */}
        <div className="absolute top-3 inset-x-0 bottom-0 bg-amber-400 rounded-lg shadow-sm z-10" />
        
        {/* PREVIEW DEL ARCHIVO / FOTO (Asomándose) */}
        {fotoUrl ? (
          <div className="absolute left-2 right-2 top-1.5 bottom-6 bg-white rounded-sm shadow-md overflow-hidden z-20 transition-transform duration-300 ease-out group-hover:-translate-y-4 group-hover:rotate-2 group-hover:shadow-lg border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={fotoUrl} 
              alt={beneficiario.nombre}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          /* Archivo de texto genérico asomándose si no hay foto */
          <div className="absolute left-3 right-3 top-2 bottom-6 bg-white rounded-sm shadow-sm z-20 border border-gray-200 p-1.5 flex flex-col gap-1 transition-transform duration-300 ease-out group-hover:-translate-y-3">
             <div className="w-full h-1 bg-gray-200 rounded-full" />
             <div className="w-3/4 h-1 bg-gray-200 rounded-full" />
             <div className="w-full h-1 bg-gray-200 rounded-full" />
          </div>
        )}
        
        {/* Cara DELANTERA de la carpeta */}
        <div className="absolute top-6 inset-x-0 bottom-0 bg-amber-300 rounded-lg shadow-[0_-2px_4px_rgba(0,0,0,0.1)] border-t border-amber-200 z-30 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        </div>
        
        {/* Badge inactivo */}
        {tienePermiso('beneficiarios:editar') && !beneficiario.activo && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white shadow-sm z-40" title="Inactivo" />
        )}
      </div>

      {/* Etiqueta de texto */}
      <span className="text-xs font-medium text-gray-700 bg-transparent px-1.5 py-0.5 rounded transition-colors group-hover:bg-blue-100 group-hover:text-blue-800 text-center w-full max-w-[120px] truncate">
        {nombreTruncado}
      </span>
    </Link>
  );
}
