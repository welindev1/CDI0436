'use client';

import { Loader2, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import { calcularPromedioNotas } from '@/lib/utils/formatters';
import type { NotaFormValues } from '@/lib/types';

interface NotaFormProps {
  estudianteNombre: string;
  values: NotaFormValues;
  guardando: boolean;
  onChange: (values: NotaFormValues) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NotaForm({
  estudianteNombre,
  values,
  guardando,
  onChange,
  onCancel,
  onSubmit,
}: NotaFormProps) {
  const promedio = calcularPromedioNotas(values);

  const update = (partial: Partial<NotaFormValues>) => onChange({ ...values, ...partial });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Ciclo Educativo del Estudiante
        </label>
        <div className="flex gap-4">
          {['Primaria', 'Secundaria'].map((ciclo) => (
            <label
              key={ciclo}
              className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                values.ciclo === ciclo
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200 text-gray-600'
              }`}
            >
              <input
                type="radio"
                name="ciclo"
                value={ciclo}
                className="sr-only"
                checked={values.ciclo === ciclo}
                onChange={(e) => update({ ciclo: e.target.value })}
              />
              <span className="font-semibold">{ciclo}</span>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-bold text-gray-700 mb-3">Curso (Grado)</label>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((c) => (
              <label
                key={c}
                className={`flex items-center justify-center py-2 border-2 rounded-lg cursor-pointer transition-all ${
                  values.curso === c
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                    : 'border-gray-200 hover:border-blue-200 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="curso"
                  value={c}
                  className="sr-only"
                  checked={values.curso === c}
                  onChange={(e) => update({ curso: Number(e.target.value) })}
                />
                {c}º
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'matematicas', label: 'Matemáticas' },
          { key: 'lengua_espanola', label: 'Lengua Española' },
          { key: 'naturales', label: 'C. Naturales' },
          { key: 'sociales', label: 'C. Sociales' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              step="0.01"
              value={values[key as keyof NotaFormValues]}
              onChange={(e) => update({ [key]: e.target.value } as Partial<NotaFormValues>)}
              className="w-full px-4 py-2 text-lg font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
        <span className="text-sm text-blue-600 block mb-1">Promedio Calculado</span>
        <span className="text-2xl font-black text-blue-800">{promedio}</span>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando} className="flex items-center gap-2">
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Notas
        </Button>
      </div>
    </form>
  );
}
