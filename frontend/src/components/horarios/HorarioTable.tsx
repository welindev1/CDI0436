'use client';

import { Horario } from '@/lib/types';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Clock, Calendar, Edit, XCircle, Trash2 } from 'lucide-react';

interface HorarioTableProps {
  horarios: Horario[];
  diasFiltrados: string[];
  horariosPorDia: Record<string, Horario[]>;
  isLoading: boolean;
  onEdit: (horario: Horario) => void;
  onDesactivar: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export default function HorarioTable({
  horarios,
  diasFiltrados,
  horariosPorDia,
  isLoading,
  onEdit,
  onDesactivar,
  onDelete,
  onCreate,
}: HorarioTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (diasFiltrados.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron horarios</p>
          <Button onClick={onCreate} className="mt-4">
            Crear Primer Horario
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {diasFiltrados.map(dia => (
        <div key={dia} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {dia}
            </h3>
          </div>
          
          <Table>
            <TableHead>
              <TableRow>
                <TableCell isHeader>Hora Inicio</TableCell>
                <TableCell isHeader>Hora Fin</TableCell>
                <TableCell isHeader>Descripción</TableCell>
                <TableCell isHeader>Clases Asignadas</TableCell>
                <TableCell isHeader>Estado</TableCell>
                <TableCell isHeader>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {horariosPorDia[dia].map((horario) => (
                <TableRow key={horario.id}>
                  <TableCell>
                    <span className="font-medium text-blue-600">
                      {horario.hora_inicio}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-blue-600">
                      {horario.hora_fin}
                    </span>
                  </TableCell>
                  <TableCell>
                    {horario.descripcion || '-'}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {horario.clases?.length || 0} clase(s)
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      horario.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {horario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(horario)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {horario.activo && (
                        <button
                          onClick={() => onDesactivar(horario.id)}
                          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Desactivar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(horario.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                        disabled={(horario.clases?.length || 0) > 0}
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
      ))}
    </div>
  );
}
