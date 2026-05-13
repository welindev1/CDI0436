'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import BeneficiarioForm from '@/components/beneficiarios/BeneficiarioForm';
import ImportarExcelModal from '@/components/beneficiarios/ImportarExcelModal';
import BeneficiarioFolder from '@/components/beneficiarios/BeneficiarioFolder';
import { beneficiariosApi } from '@/lib/api/beneficiarios';
import { useAuth } from '@/contexts/AuthContext';
import { Beneficiario } from '@/lib/types';
import {
  Plus,
  Search,
  Download,
  Upload,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function BeneficiariosPage() {
  const { tienePermiso } = useAuth();
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedBeneficiario, setSelectedBeneficiario] = useState<Beneficiario | undefined>();
  const [isExporting, setIsExporting] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 28; // Muestra 4 filas de 7 carpetas (aprox, depende de pantalla)

  const puedeCrear = tienePermiso('beneficiarios:crear');

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

  const handleExportar = async () => {
    try {
      setIsExporting(true);
      setError('');
      const blob = await beneficiariosApi.exportarAExcel();
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
    } catch (err: any) {
      setError(err.message || 'Error al exportar');
    } finally {
      setIsExporting(false);
    }
  };

  // Filtrado
  const filteredBeneficiarios = beneficiarios.filter(b =>
    b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reiniciar a la página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Cálculos de Paginación
  const totalPages = Math.ceil(filteredBeneficiarios.length / itemsPerPage);
  const paginatedBeneficiarios = filteredBeneficiarios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <ProtectedRoute requiredPermisos={['beneficiarios:ver']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Beneficiarios</h1>
              <p className="text-gray-600 mt-1">Directorio de archivos y carpetas del programa</p>
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
                    placeholder="Buscar archivo por nombre, apellido o código..."
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

          {/* Grid de Carpetas y Paginación */}
          <div className="bg-white rounded-lg shadow min-h-[400px] p-6 flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredBeneficiarios.length === 0 ? (
              <div className="flex-1 text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">La carpeta está vacía. No se encontraron beneficiarios.</p>
                {puedeCrear && (
                  <div className="flex items-center justify-center gap-2">
                    <Button onClick={handleCreate}>
                      Crear Primer Beneficiario
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-y-10 gap-x-4">
                  {paginatedBeneficiarios.map((beneficiario) => (
                    <BeneficiarioFolder key={beneficiario.id} beneficiario={beneficiario} />
                  ))}
                </div>

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredBeneficiarios.length)}</span> de <span className="font-medium">{filteredBeneficiarios.length}</span> beneficiarios
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        onClick={prevPage} 
                        disabled={currentPage === 1}
                        className="px-3"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="text-sm font-medium text-gray-700 px-4">
                        Página {currentPage} de {totalPages}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={nextPage} 
                        disabled={currentPage === totalPages}
                        className="px-3"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal Crear */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Nuevo Beneficiario"
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}