'use client';

import { Tutor } from '@/lib/types';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { UserCircle, UserX, Phone, Mail, BookOpen, Edit, Trash2 } from 'lucide-react';

interface TutorTableProps {
  tutores: Tutor[];
  isLoading: boolean;
  onEdit: (tutor: Tutor) => void;
  onDesactivar: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export default function TutorTable({
  tutores,
  isLoading,
  onEdit,
  onDesactivar,
  onDelete,
  onCreate,
}: TutorTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (tutores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="text-center py-12">
          <UserCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron tutores</p>
          <Button onClick={onCreate} className="mt-4">
            Crear Primer Tutor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell isHeader>Nombre</TableCell>
            <TableCell isHeader>Contacto</TableCell>
            <TableCell isHeader>Especialidad</TableCell>
            <TableCell isHeader>Tipo</TableCell>
            <TableCell isHeader>Clases</TableCell>
            <TableCell isHeader>Estado</TableCell>
            <TableCell isHeader>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tutores.map((tutor) => (
            <TableRow key={tutor.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {tutor.nombre} {tutor.apellido}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {tutor.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{tutor.telefono}</span>
                    </div>
                  )}
                  {tutor.correo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{tutor.correo}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {tutor.especialidad || '-'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tutor.tipo === 'club'
                    ? 'bg-indigo-100 text-indigo-800'
                    : tutor.tipo === 'ambos'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {tutor.tipo === 'club' ? 'Club' : tutor.tipo === 'ambos' ? 'Ambos' : 'Clase'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span>{tutor.clases?.length || 0}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tutor.activo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tutor.activo ? 'Activo' : 'Inactivo'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(tutor)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {tutor.activo && (
                    <button
                      onClick={() => onDesactivar(tutor.id)}
                      className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                      title="Desactivar"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(tutor.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
