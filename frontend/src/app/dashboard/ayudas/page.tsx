'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { ayudasApi, Ayuda } from '@/lib/api/ayudas';
import { Download, CheckCircle, XCircle, Trash2, Search } from 'lucide-react';

export default function AyudasPage() {
  const [ayudas, setAyudas] = useState<Ayuda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAyudas = async () => {
    try {
      setLoading(true);
      const data = await ayudasApi.findAll();
      setAyudas(data);
    } catch (err) {
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAyudas();
  }, []);

  const handleEstado = async (id: string, estado: 'aprobada' | 'rechazada') => {
    if (!confirm(`¿Estás seguro de ${estado === 'aprobada' ? 'aprobar' : 'rechazar'} esta solicitud?`)) return;
    try {
      await ayudasApi.updateEstado(id, estado);
      fetchAyudas();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;
    try {
      await ayudasApi.remove(id);
      fetchAyudas();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await ayudasApi.exportar();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ayudas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al exportar');
    }
  };

  const filteredAyudas = ayudas.filter(a =>
    a.nombre_beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.codigo_beneficiario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Solicitudes de Ayuda</h1>
            <p className="text-gray-600 mt-1">Administra las solicitudes registradas por los beneficiarios</p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Exportar a Excel
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficiario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAyudas.map((ayuda) => (
                    <tr key={ayuda.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ayuda.codigo_beneficiario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{ayuda.nombre_beneficiario}</div>
                        <div className="text-xs text-gray-500">Tutor: {ayuda.nombre_tutor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ayuda.tipo === 'medica' ? 'bg-red-100 text-red-800' :
                          ayuda.tipo === 'alimentos' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ayuda.tipo === 'medica' ? 'Médica' : ayuda.tipo === 'alimentos' ? 'Alimentos' : 'Otros'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={ayuda.detalle}>
                        {ayuda.detalle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ayuda.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                          ayuda.estado === 'rechazada' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ayuda.estado.charAt(0).toUpperCase() + ayuda.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {ayuda.estado === 'pendiente' && (
                            <>
                              <button
                                onClick={() => handleEstado(ayuda.id, 'aprobada')}
                                title="Aprobar"
                                className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full hover:bg-green-100 transition"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEstado(ayuda.id, 'rechazada')}
                                title="Rechazar"
                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(ayuda.id)}
                            title="Eliminar"
                            className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAyudas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No se encontraron solicitudes registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
