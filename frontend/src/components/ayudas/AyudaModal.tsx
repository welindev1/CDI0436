'use client';

import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { X, Upload } from 'lucide-react';
import type { Ayuda } from '@/lib/types';

interface AyudaModalProps {
  fotoModal: string | null;
  onCloseFoto: () => void;
  fotoEntregaModal: Ayuda | null;
  fotoEntregaPreview: string | null;
  loadingFotoEntrega: boolean;
  onFotoEntregaSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubirFotoEntrega: () => void;
  onCancelFotoEntrega: () => void;
  fotoEntregaModalView: string | null;
  onCloseFotoEntregaView: () => void;
}

export function AyudaModal({
  fotoModal,
  onCloseFoto,
  fotoEntregaModal,
  fotoEntregaPreview,
  loadingFotoEntrega,
  onFotoEntregaSelect,
  onSubirFotoEntrega,
  onCancelFotoEntrega,
  fotoEntregaModalView,
  onCloseFotoEntregaView,
}: AyudaModalProps) {
  return (
    <>
      {/* Modal para ver foto de la solicitud */}
      <Modal isOpen={!!fotoModal} onClose={onCloseFoto} title="Foto de la Solicitud" size="lg">
        <div className="flex justify-center">
          <Image
            src={fotoModal || ''}
            alt="Foto de la solicitud"
            className="max-w-full max-h-[60vh] object-contain rounded-lg"
            width={800}
            height={600}
            unoptimized
          />
        </div>
      </Modal>

      {/* Modal para subir foto de entrega */}
      <Modal
        isOpen={!!fotoEntregaModal}
        onClose={onCancelFotoEntrega}
        title={fotoEntregaModal ? `Subir Foto de Entrega - ${fotoEntregaModal.nombre_beneficiario}` : 'Subir Foto de Entrega'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Sube una foto como evidencia de que la ayuda fue entregada al beneficiario.
          </p>

          {fotoEntregaPreview ? (
            <div className="relative">
              <Image
                src={fotoEntregaPreview || ''}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
                width={400}
                height={192}
                unoptimized
              />
              <button
                onClick={onCancelFotoEntrega}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Haz clic para seleccionar una imagen</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG (max. 5MB)</span>
              <input type="file" accept="image/*" className="hidden" onChange={onFotoEntregaSelect} />
            </label>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancelFotoEntrega}>
              Cancelar
            </Button>
            <Button
              onClick={onSubirFotoEntrega}
              disabled={!fotoEntregaPreview || loadingFotoEntrega}
            >
              {loadingFotoEntrega ? 'Subiendo...' : 'Subir Foto'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para ver foto de entrega */}
      <Modal
        isOpen={!!fotoEntregaModalView}
        onClose={onCloseFotoEntregaView}
        title="Foto de Entrega"
        size="lg"
      >
        <div className="flex justify-center">
          <Image
            src={fotoEntregaModalView || ''}
            alt="Foto de entrega"
            className="max-w-full max-h-[60vh] object-contain rounded-lg"
            width={800}
            height={600}
            unoptimized
          />
        </div>
      </Modal>
    </>
  );
}
