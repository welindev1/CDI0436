import apiClient from './client';

export interface Trabajador {
  id: string;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  correo: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface AsistenciaPersonal {
  id: string;
  trabajador: Trabajador;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  turno: 'matutino' | 'vespertino';
  registrado_por: { id: string; nombre: string } | null;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface CreateTrabajadorDto {
  nombre: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
}

export interface UpdateTrabajadorDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
}

export interface MarcarEntradaDto {
  fecha: string;
  turno?: 'matutino' | 'vespertino';
  hora_entrada?: string;
  notas?: string;
}

export interface MarcarSalidaDto {
  fecha: string;
  hora_salida: string;
}

export const getTrabajadores = async (): Promise<Trabajador[]> => {
  const response = await apiClient.get('/asistencia-personal/trabajadores');
  return response.data;
};

export const createTrabajador = async (data: CreateTrabajadorDto): Promise<Trabajador> => {
  const response = await apiClient.post('/asistencia-personal/trabajadores', data);
  return response.data;
};

export const updateTrabajador = async (id: string, data: UpdateTrabajadorDto): Promise<Trabajador> => {
  const response = await apiClient.patch(`/asistencia-personal/trabajadores/${id}`, data);
  return response.data;
};

export const deleteTrabajador = async (id: string): Promise<void> => {
  await apiClient.delete(`/asistencia-personal/trabajadores/${id}`);
};

export const getAsistenciasByFecha = async (fecha: string, turno?: string): Promise<AsistenciaPersonal[]> => {
  if (turno) {
    const response = await apiClient.get(`/asistencia-personal/fecha/${fecha}/turno/${turno}`);
    return response.data;
  }
  const response = await apiClient.get(`/asistencia-personal?fecha=${fecha}`);
  return response.data;
};

export const marcarEntrada = async (trabajadorId: string, data: MarcarEntradaDto): Promise<AsistenciaPersonal> => {
  const response = await apiClient.post(`/asistencia-personal/trabajadores/${trabajadorId}/entrada`, data);
  return response.data;
};

export const marcarSalida = async (trabajadorId: string, data: MarcarSalidaDto): Promise<AsistenciaPersonal> => {
  const response = await apiClient.patch(`/asistencia-personal/trabajadores/${trabajadorId}/salida`, data);
  return response.data;
};

export const eliminarAsistencia = async (id: string): Promise<void> => {
  await apiClient.delete(`/asistencia-personal/${id}`);
};

export const actualizarNotas = async (
  fecha: string,
  turno: string | undefined,
  notas: string,
): Promise<AsistenciaPersonal[]> => {
  const response = await apiClient.post('/asistencia-personal/notas', {
    fecha,
    turno,
    notas,
  });
  return response.data;
};

export const descargarPdfDiario = async (fecha: string, turno?: string): Promise<Blob> => {
  const params = new URLSearchParams({ fecha });
  if (turno) params.append('turno', turno);
  const response = await apiClient.get(`/asistencia-personal/reporte/pdf/diario?${params}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const descargarPdfSemanal = async (fechaInicio: string, fechaFin: string): Promise<Blob> => {
  const params = new URLSearchParams({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
  const response = await apiClient.get(`/asistencia-personal/reporte/pdf/semanal?${params}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const descargarPdfMensual = async (mes: number, anio: number): Promise<Blob> => {
  const params = new URLSearchParams({ mes: String(mes), anio: String(anio) });
  const response = await apiClient.get(`/asistencia-personal/reporte/pdf/mensual?${params}`, {
    responseType: 'blob',
  });
  return response.data;
};
