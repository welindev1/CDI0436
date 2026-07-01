'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, X, UtensilsCrossed as Fork, Edit2, Trash2, Plus } from 'lucide-react';
import type { MenuNutricion, TandaNutricion } from '@/lib/types';

interface MenuFormProps {
  diaSeleccionado: string | null;
  tanda: TandaNutricion;
  menu: MenuNutricion | null;
  loadingMenu: boolean;
  onSave: (data: {
    titulo: string;
    meriendas: string;
    observaciones: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  onOpenCreate: () => void;
  onOpenEdit: (menu: MenuNutricion) => void;
}

export default function MenuForm({
  diaSeleccionado,
  tanda,
  menu,
  loadingMenu,
  onSave,
  onDelete,
  onOpenCreate,
  onOpenEdit,
}: MenuFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuNutricion | null>(null);
  const [formTitulo, setFormTitulo] = useState('');
  const [formMeriendas, setFormMeriendas] = useState('');
  const [formObservaciones, setFormObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setEditingMenu(null);
    setFormTitulo('');
    setFormMeriendas('');
    setFormObservaciones('');
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (m: MenuNutricion) => {
    setEditingMenu(m);
    setFormTitulo(m.titulo_menu);
    setFormMeriendas(m.meriendas_servidas?.toString() ?? '');
    setFormObservaciones(m.observaciones ?? '');
    setFormError('');
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (!formTitulo.trim()) {
      setFormError('El título del menú es requerido');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await onSave({
        titulo: formTitulo.trim(),
        meriendas: formMeriendas,
        observaciones: formObservaciones,
      });
      setShowModal(false);
    } catch (err: unknown) {
      setFormError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al guardar el menú');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Sección Menú del Día */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Fork className="w-5 h-5 text-green-600" />
            Menú del Día — Tanda {tanda === 'matutina' ? 'Matutina' : 'Vespertina'}
          </h3>
          {!loadingMenu && (
            menu ? (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(menu)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            ) : (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Agregar Menú
              </button>
            )
          )}
        </div>

        <div className="p-6">
          {loadingMenu ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-green-500" />
            </div>
          ) : menu ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Fork className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wide">Menú del día</p>
                  <h4 className="text-xl font-bold text-gray-900">{menu.titulo_menu}</h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Meriendas Servidas</p>
                  {menu.meriendas_servidas !== null ? (
                    <p className="text-3xl font-bold text-amber-600">{menu.meriendas_servidas}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Sin registrar</span>
                      <button onClick={() => openEdit(menu)} className="text-xs text-amber-600 underline hover:no-underline">
                        Agregar
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Observaciones</p>
                  {menu.observaciones ? (
                    <p className="text-sm text-gray-700">{menu.observaciones}</p>
                  ) : (
                    <span className="text-gray-400 text-sm italic">Sin observaciones</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Fork className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No hay menú registrado para esta fecha y tanda</p>
              <p className="text-sm text-gray-400 mt-1">Haz click en &quot;Agregar Menú&quot; para registrarlo</p>
              <button
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Agregar Menú
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">
                {editingMenu ? 'Editar Menú' : 'Nuevo Menú'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {formError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Menú <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitulo}
                  onChange={e => setFormTitulo(e.target.value)}
                  placeholder="Ej: Arroz Blanco con Huevo"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meriendas Servidas</label>
                <input
                  type="number"
                  min="0"
                  value={formMeriendas}
                  onChange={e => setFormMeriendas(e.target.value)}
                  placeholder="Cantidad de meriendas"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Puedes dejarlo en blanco y completarlo más tarde</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  value={formObservaciones}
                  onChange={e => setFormObservaciones(e.target.value)}
                  rows={3}
                  placeholder="Notas adicionales..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={saving || !formTitulo.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingMenu ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
