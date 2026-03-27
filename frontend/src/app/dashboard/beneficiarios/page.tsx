'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import BeneficiarioForm from '@/components/beneficiarios/BeneficiarioForm';
import ImportarExcelModal from '@/components/beneficiarios/ImportarExcelModal';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { useAuth } from '@/contexts/AuthContext';
import { Beneficiario } from '@/lib/types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserX,
  Filter,
  Download,
  Upload,
  Users,
  Baby,
  Home,
  Building,
  HeartPulse
} from 'lucide-react';

function calcularEdad(fechaNacimiento: string | undefined): number | null {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

function calcularEdadEnMeses(fechaNacimiento: string | undefined): number | null {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();

  const años = hoy.getFullYear() - nacimiento.getFullYear();
  const meses = hoy.getMonth() - nacimiento.getMonth();
  const dias = hoy.getDate() - nacimiento.getDate();

  let totalMeses = años * 12 + meses;
  if (dias < 0) {
    totalMeses--;
  }

  return totalMeses;
}

type ClasificacionBeneficiario = 'Supervivencia' | 'Basado en Casa' | 'Basado en Centro' | 'Mujeres Embarazadas';

function clasificarBeneficiario(fechaNacimiento: string | undefined): ClasificacionBeneficiario {
  const edadMeses = calcularEdadEnMeses(fechaNacimiento);
  if (edadMeses === null) return 'Mujeres Embarazadas';

  // Supervivencia: 0 a 11 meses
  if (edadMeses >= 0 && edadMeses <= 11) {
    return 'Supervivencia';
  }
  // Basado en Casa: 12 meses (1 año) a 35 meses (2 años y 11 meses)
  if (edadMeses >= 12 && edadMeses <= 35) {
    return 'Basado en Casa';
  }
  // Basado en Centro: 36 meses (3 años) en adelante
  if (edadMeses >= 36) {
    return 'Basado en Centro';
  }

  return 'Mujeres Embarazadas';
}

function formatearEdad(fechaNacimiento: string | undefined): string {
  const edadMeses = calcularEdadEnMeses(fechaNacimiento);
  if (edadMeses === null) return '-';

  if (edadMeses < 12) {
    return `${edadMeses} ${edadMeses === 1 ? 'mes' : 'meses'}`;
  }

  const años = Math.floor(edadMeses / 12);
  const mesesRestantes = edadMeses % 12;

  if (mesesRestantes === 0) {
    return `${años} ${años === 1 ? 'año' : 'años'}`;
  }

  return `${años} ${años === 1 ? 'año' : 'años'}, ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
}

export default function BeneficiariosPage() {
  const { tienePermiso } = useAuth();
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedBeneficiario, setSelectedBeneficiario] = useState<Beneficiario | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const puedeCrear = tienePermiso('beneficiarios:crear');
  const puedeEditar = tienePermiso('beneficiarios:editar');
  const puedeEliminar = tienePermiso('beneficiarios:eliminar');

  useEffect(() => {
    loadBeneficiarios();
  }, []);

  const loadBeneficiarios = async () => {
    try {
      setIsLoading(true);
      const data = await beneficiariosApi.getAll();
      setBeneficiarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar beneficiarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBeneficiario(undefined);
    setShowModal(true);
  };

  const handleEdit = (beneficiario: Beneficiario) => {
    setSelectedBeneficiario(beneficiario);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Beneficiario>) => {
    try {
      if (selectedBeneficiario) {
        await beneficiariosApi.update(selectedBeneficiario.id, data);
      } else {
        await beneficiariosApi.create(data);
      }
      setShowModal(false);
      loadBeneficiarios();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDeleteClick = (id: string) => {
    setBeneficiarioToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!beneficiarioToDelete) return;

    try {
      await beneficiariosApi.delete(beneficiarioToDelete);
      setShowDeleteConfirm(false);
      setBeneficiarioToDelete(null);
      loadBeneficiarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar beneficiario');
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      await beneficiariosApi.desactivar(id);
      loadBeneficiarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al desactivar beneficiario');
    }
  };

  const handleExportar = async () => {
    try {
      setIsExporting(true);
      setError('');
      console.log('Iniciando exportación de beneficiarios...');

      const blob = await beneficiariosApi.exportarAExcel();
      console.log('Blob recibido:', blob);

      if (!blob || blob.size === 0) {
        throw new Error('El archivo exportado está vacío');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fecha = new Date().toISOString().split('T')[0];
      a.download = `beneficiarios_${fecha}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Exportación completada exitosamente');
    } catch (err: any) {
      console.error('Error detallado al exportar:', err);

      let errorMessage = 'Error al exportar beneficiarios';

      if (err.response?.data instanceof Blob && err.response.data.type === 'application/json') {
        try {
          const text = await err.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseErr) {
          console.error('No se pudo parsear el error:', parseErr);
        }
      } else if (err.response?.status === 404) {
        errorMessage = 'Endpoint de exportación no encontrado. Verifica que el backend esté corriendo.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error en el servidor al generar el archivo Excel.';
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredBeneficiarios = beneficiarios.filter(b =>
    b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermisos={['beneficiarios:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Beneficiarios</h1>
              <p className="text-gray-600 mt-1">Gestión de beneficiarios del programa</p>
            </div>
            {(puedeCrear) && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 justify-center"
                >
                  <Upload className="w-4 h-4" />
                  Importar Excel
                </Button>
                <Button onClick={handleCreate} className="flex items-center gap-2 justify-center">
                  <Plus className="w-5 h-5" />
                  Nuevo Beneficiario
                </Button>
              </div>
            )}
          </div>

          {/* Stats - Primera fila */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{beneficiarios.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {beneficiarios.filter(b => b.activo).length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {beneficiarios.filter(b => !b.activo).length}
                  </p>
                </div>
                <UserX className="w-8 h-8 text-gray-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Edad Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const edades = beneficiarios
                        .map(b => calcularEdad(b.fecha_nacimiento))
                        .filter((e): e is number => e !== null);
                      return edades.length > 0
                        ? Math.round(edades.reduce((a, b) => a + b, 0) / edades.length)
                        : 0;
                    })()} años
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Stats - Segunda fila: Clasificación por edad */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-pink-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Supervivencia</p>
                  <p className="text-xs text-gray-400 mb-1">0 - 11 meses</p>
                  <p className="text-2xl font-bold text-pink-600">
                    {beneficiarios.filter(b => b.activo && clasificarBeneficiario(b.fecha_nacimiento) === 'Supervivencia').length}
                  </p>
                </div>
                <Baby className="w-8 h-8 text-pink-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Basado en Casa</p>
                  <p className="text-xs text-gray-400 mb-1">1 año - 2 años 11 meses</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {beneficiarios.filter(b => b.activo && clasificarBeneficiario(b.fecha_nacimiento) === 'Basado en Casa').length}
                  </p>
                </div>
                <Home className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Basado en Centro</p>
                  <p className="text-xs text-gray-400 mb-1">3 años en adelante</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {beneficiarios.filter(b => b.activo && clasificarBeneficiario(b.fecha_nacimiento) === 'Basado en Centro').length}
                  </p>
                </div>
                <Building className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-rose-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mujeres Embarazadas</p>
                  <p className="text-xs text-gray-400 mb-1">Sin fecha de nacimiento</p>
                  <p className="text-2xl font-bold text-rose-600">
                    {beneficiarios.filter(b => b.activo && !b.fecha_nacimiento).length}
                  </p>
                </div>
                <HeartPulse className="w-8 h-8 text-rose-500" />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportar}
                  disabled={isExporting}
                  isLoading={isExporting}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredBeneficiarios.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No se encontraron beneficiarios</p>
                {puedeCrear && (
                  <div className="flex items-center justify-center gap-2">
                    <Button onClick={handleCreate}>
                      Crear Primer Beneficiario
                    </Button>
                    <Button variant="outline" onClick={() => setShowImportModal(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar desde Excel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell isHeader>Código</TableCell>
                    <TableCell isHeader>Nombre</TableCell>
                    <TableCell isHeader>Edad</TableCell>
                    <TableCell isHeader>Clasificación</TableCell>
                    <TableCell isHeader>Padre/Tutor</TableCell>
                    <TableCell isHeader>Teléfono</TableCell>
                    <TableCell isHeader>Estado</TableCell>
                    <TableCell isHeader>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBeneficiarios.map((beneficiario) => (
                    <TableRow key={beneficiario.id}>
                      <TableCell>
                        <span className="font-medium text-blue-600">
                          {beneficiario.codigo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {beneficiario.nombre} {beneficiario.apellido}
                          </p>
                          {beneficiario.correo && (
                            <p className="text-sm text-gray-500">{beneficiario.correo}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatearEdad(beneficiario.fecha_nacimiento)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const clasificacion = clasificarBeneficiario(beneficiario.fecha_nacimiento);
                          const estilos: Record<ClasificacionBeneficiario, string> = {
                            'Supervivencia': 'bg-pink-100 text-pink-800 border-pink-200',
                            'Basado en Casa': 'bg-orange-100 text-orange-800 border-orange-200',
                            'Basado en Centro': 'bg-blue-100 text-blue-800 border-blue-200',
                            'Mujeres Embarazadas': 'bg-rose-100 text-rose-800 border-rose-200'
                          };
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${estilos[clasificacion]}`}>
                              {clasificacion}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell>{beneficiario.padre_tutor || '-'}</TableCell>
                      <TableCell>{beneficiario.telefono || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          beneficiario.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {beneficiario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {puedeEditar && (
                            <button
                              onClick={() => handleEdit(beneficiario)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {puedeEditar && beneficiario.activo && (
                            <button
                              onClick={() => handleDesactivar(beneficiario.id)}
                              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                              title="Desactivar"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          {puedeEliminar && (
                            <button
                              onClick={() => handleDeleteClick(beneficiario.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {!puedeEditar && !puedeEliminar && (
                            <span className="text-xs text-gray-400">Solo lectura</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedBeneficiario ? 'Editar Beneficiario' : 'Nuevo Beneficiario'}
          size="lg"
        >
          <BeneficiarioForm
            beneficiario={selectedBeneficiario}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>

        {/* Modal Importar Excel */}
        <ImportarExcelModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={loadBeneficiarios}
        />

        {/* Modal Confirmar Eliminación */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirmar Eliminación"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar este beneficiario? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}