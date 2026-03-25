'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { ayudasApi, Ayuda, ComentarioAyuda } from '@/lib/api/ayudas';
import { Download, CheckCircle, XCircle, Trash2, Search, Phone, Image, X, MessageSquare, Send, Filter } from 'lucide-react';

type EstadoFiltro = 'pendiente' | 'aprobada' | 'rechazada' | 'todos';

export default function AyudasPage() {
  const [ayudas, setAyudas] = useState<Ayuda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('pendiente');
  const [fotoModal, setFotoModal] = useState<string | null>(null);

  // Estado para detalle hover
  const [detalleHover, setDetalleHover] = useState<{ id: string; x: number; y: number } | null>(null);

  // Estado para comentarios
  const [comentariosModal, setComentariosModal] = useState<Ayuda | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioAyuda[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [comentarioHover, setComentarioHover] = useState<{ id: string; x: number; y: number } | null>(null);

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
    if (!confirm(`Estas seguro de ${estado === 'aprobada' ? 'aprobar' : 'rechazar'} esta solicitud?`)) return;
    try {
      await ayudasApi.updateEstado(id, estado);
      fetchAyudas();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Estas seguro de eliminar esta solicitud?')) return;
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

  // Cargar comentarios
  const openComentarios = async (ayuda: Ayuda) => {
    setComentariosModal(ayuda);
    setLoadingComentarios(true);
    try {
      const data = await ayudasApi.getComentarios(ayuda.id);
      setComentarios(data);
    } catch (err) {
      console.error('Error al cargar comentarios');
    } finally {
      setLoadingComentarios(false);
    }
  };

  const handleAddComentario = async () => {
    if (!nuevoComentario.trim() || !comentariosModal) return;

    try {
      const comentario = await ayudasApi.createComentario(comentariosModal.id, {
        contenido: nuevoComentario,
        autor: 'Administrador', // Puedes obtener esto del usuario logueado
      });
      setComentarios([comentario, ...comentarios]);
      setNuevoComentario('');
    } catch (err) {
      alert('Error al agregar comentario');
    }
  };

  // Filtrar ayudas por estado y busqueda
  const filteredAyudas = ayudas.filter(a => {
    const matchSearch = a.nombre_beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.codigo_beneficiario.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = estadoFiltro === 'todos' || a.estado === estadoFiltro;
    return matchSearch && matchEstado;
  });

  // Contar por estado
  const countByEstado = {
    pendiente: ayudas.filter(a => a.estado === 'pendiente').length,
    aprobada: ayudas.filter(a => a.estado === 'aprobada').length,
    rechazada: ayudas.filter(a => a.estado === 'rechazada').length,
    todos: ayudas.length,
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion de Solicitudes de Ayuda</h1>
            <p className="text-gray-600 mt-1">Administra las solicitudes registradas por los beneficiarios</p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            {/* Filtros de estado */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setEstadoFiltro('pendiente')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  estadoFiltro === 'pendiente'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                Pendientes ({countByEstado.pendiente})
              </button>
              <button
                onClick={() => setEstadoFiltro('aprobada')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  estadoFiltro === 'aprobada'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                Aprobadas ({countByEstado.aprobada})
              </button>
              <button
                onClick={() => setEstadoFiltro('rechazada')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  estadoFiltro === 'rechazada'
                    ? 'bg-red-500 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Rechazadas ({countByEstado.rechazada})
              </button>
              <button
                onClick={() => setEstadoFiltro('todos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  estadoFiltro === 'todos'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({countByEstado.todos})
              </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o codigo..."
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
                      Codigo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficiario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefono
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ayuda.tipo === 'medica' ? 'bg-red-100 text-red-800' :
                          ayuda.tipo === 'alimentos' ? 'bg-green-100 text-green-800' :
                          ayuda.tipo === 'pequeno_negocio' ? 'bg-purple-100 text-purple-800' :
                          ayuda.tipo === 'educacion' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ayuda.tipo === 'medica' ? 'Medica' :
                          ayuda.tipo === 'alimentos' ? 'Alimentos' :
                          ayuda.tipo === 'pequeno_negocio' ? 'Peq. Negocio' :
                          ayuda.tipo === 'educacion' ? 'Educacion' :
                          ayuda.tipo_especificacion ? `Otros: ${ayuda.tipo_especificacion}` : 'Otros'}
                        </span>
                        {ayuda.foto_url && (
                          <button
                            onClick={() => setFotoModal(ayuda.foto_url!)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                            title="Ver foto"
                          >
                            <Image className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs relative">
                        <div
                          className="truncate cursor-pointer hover:text-blue-600"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDetalleHover({ id: ayuda.id, x: rect.left, y: rect.bottom });
                          }}
                          onMouseLeave={() => setDetalleHover(null)}
                        >
                          {ayuda.detalle}
                        </div>
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
                          <button
                            onClick={() => openComentarios(ayuda)}
                            title="Ver comentarios"
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
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
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No se encontraron solicitudes {estadoFiltro !== 'todos' ? estadoFiltro + 's' : ''}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tooltip para detalle */}
        {detalleHover && (
          <div
            className="fixed z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md text-sm"
            style={{
              left: Math.min(detalleHover.x, window.innerWidth - 400),
              top: detalleHover.y + 8,
            }}
          >
            <p className="font-medium mb-1">Detalle completo:</p>
            <p className="whitespace-pre-wrap">
              {ayudas.find(a => a.id === detalleHover.id)?.detalle}
            </p>
          </div>
        )}

        {/* Modal para ver foto */}
        {fotoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
              <button
                onClick={() => setFotoModal(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={fotoModal}
                alt="Foto de la solicitud"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Modal para comentarios */}
        {comentariosModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold">Comentarios</h3>
                  <p className="text-sm text-gray-500">
                    {comentariosModal.nombre_beneficiario} - {comentariosModal.codigo_beneficiario}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setComentariosModal(null);
                    setComentarios([]);
                    setNuevoComentario('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Agregar nuevo comentario */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComentario()}
                  />
                  <button
                    onClick={handleAddComentario}
                    disabled={!nuevoComentario.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Lista de comentarios */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingComentarios ? (
                  <div className="text-center py-8 text-gray-500">Cargando comentarios...</div>
                ) : comentarios.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No hay comentarios aun</div>
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
                        <span className="text-xs text-blue-600 cursor-pointer">Pasa el mouse para ver mas</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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
              {comentarios.find(c => c.id === comentarioHover.id)?.contenido}
            </p>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
