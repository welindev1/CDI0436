'use client';

import { X } from 'lucide-react';

interface FotoGalleryProps {
  isOpen: boolean;
  fotoUrl: string;
  nombre: string;
  onClose: () => void;
}

export default function FotoGallery({ isOpen, fotoUrl, nombre, onClose }: FotoGalleryProps) {
  if (!isOpen || !fotoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative" onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotoUrl} alt={nombre} className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain" />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white text-gray-700 rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
