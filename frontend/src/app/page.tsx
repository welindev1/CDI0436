'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { ayudasApi } from '@/lib/api/ayudas';
import { FileText } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await ayudasApi.create(data);
      setSuccess('¡Solicitud registrada correctamente! Pronto recibirás una respuesta.');
      reset();
    } catch (err: any) {
      setError('Error al registrar la solicitud. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Solicitud de Ayuda
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            CDI - Centro de Desarrollo Integral
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Registrar Solicitud de Ayuda
          </h2>

          {error && <Alert variant="error" className="mb-6">{error}</Alert>}
          {success && <Alert variant="success" className="mb-6">{success}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre Beneficiario"
                type="text"
                {...register('nombre_beneficiario', { required: true })}
                error={errors.nombre_beneficiario ? 'Este campo es requerido' : ''}
                placeholder="Nombre completo del beneficiario"
              />
              <Input
                label="Código Beneficiario"
                type="text"
                {...register('codigo_beneficiario', { required: true })}
                error={errors.codigo_beneficiario ? 'Este campo es requerido' : ''}
                placeholder="Ej: BEN001"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre del Padre o Tutor"
                type="text"
                {...register('nombre_madre', { required: true })}
                error={errors.nombre_madre ? 'Este campo es requerido' : ''}
                placeholder="Nombre completo de la madre"
              />
              <Input
                label="Nombre del Tutor"
                type="text"
                {...register('nombre_tutor', { required: true })}
                error={errors.nombre_tutor ? 'Este campo es requerido' : ''}
                placeholder="Nombre completo del tutor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Ayuda
              </label>
              <select
                {...register('tipo', { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione el tipo de ayuda...</option>
                <option value="medica">Ayuda Médica</option>
                <option value="alimentos">Alimentos</option>
                <option value="otros">Otros</option>
              </select>
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-600">Este campo es requerido</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detalle de la Solicitud
              </label>
              <textarea
                {...register('detalle', { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Describa detalladamente el motivo de la solicitud..."
              ></textarea>
              {errors.detalle && (
                <p className="mt-1 text-sm text-red-600">Este campo es requerido</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
            >
              Registrar Solicitud
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600">
          © 2024 CDI. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
