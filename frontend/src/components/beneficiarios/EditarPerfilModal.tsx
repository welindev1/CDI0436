'use client';

import { useState, useRef } from 'react';
import { X, ImagePlus, UserCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Beneficiario } from '@/lib/types';

interface EditarPerfilModalProps {
  beneficiario: Beneficiario;
  onClose: () => void;
  onSave: (data: Partial<Beneficiario> & { newFotoBase64?: string }) => Promise<void>;
}

const compressImage = (file: File, maxWidth = 600): Promise<string> =>
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
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

export default function EditarPerfilModal({ beneficiario, onClose, onSave }: EditarPerfilModalProps) {
  const [nombre, setNombre] = useState(beneficiario.nombre || '');
  const [apellido, setApellido] = useState(beneficiario.apellido || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(
    beneficiario.fecha_nacimiento ? String(beneficiario.fecha_nacimiento).split('T')[0] : ''
  );
  const [telefono, setTelefono] = useState(beneficiario.telefono || '');
  const [correo, setCorreo] = useState(beneficiario.correo || '');
  const [padreTutor, setPadreTutor] = useState(beneficiario.padre_tutor || '');
  const [direccion, setDireccion] = useState(beneficiario.direccion || '');
  const [newFotoBase64, setNewFotoBase64] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fotoRef = useRef<HTMLInputElement>(null);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNewFotoBase64(await compressImage(file, 600));
  };

  const fotoActual = newFotoBase64 || beneficiario.foto_url;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {};
      if (nombre) payload.nombre = nombre;
      
      // Enviar como null o string dependiendo si está vacío, para evitar errores de validación
      payload.apellido = apellido || null;
      payload.telefono = telefono || null;
      payload.correo = correo || null;
      payload.padre_tutor = padreTutor || null;
      payload.direccion = direccion || null;
      
      if (fechaNacimiento) {
        payload.fecha_nacimiento = fechaNacimiento;
      } else {
        payload.fecha_nacimiento = null;
      }
      
      if (newFotoBase64) payload.foto_url = newFotoBase64;
      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Editar Perfil" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Foto de perfil */}
        <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-xl">
          <div
            onClick={() => fotoRef.current?.click()}
            className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md cursor-pointer flex-shrink-0 group"
          >
            {fotoActual ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoActual} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-indigo-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ImagePlus className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Foto de perfil</p>
            <p className="text-xs text-gray-500 mt-0.5">Haz clic en la imagen para cambiarla</p>
            {newFotoBase64 && (
              <button type="button" onClick={() => setNewFotoBase64(null)}
                className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1">
                <X className="w-3 h-3" /> Descartar cambio
              </button>
            )}
          </div>
          <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
        </div>

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Fecha nacimiento y Teléfono */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={e => setFechaNacimiento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="809-000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Padre/Tutor y Correo */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Padre / Tutor</label>
            <input
              value={padreTutor}
              onChange={e => setPadreTutor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <textarea
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
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
