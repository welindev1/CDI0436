// Enums
export enum EstadoAsistencia {
  PRESENTE = 'presente',
  AUSENTE = 'ausente',
  JUSTIFICADO = 'justificado',
  TARDE = 'tarde',
}

export enum DiaSemana {
  LUNES = 'lunes',
  MARTES = 'martes',
  MIERCOLES = 'miercoles',
  JUEVES = 'jueves',
  VIERNES = 'viernes',
  SABADO = 'sabado',
  DOMINGO = 'domingo',
}

// Permisos y Roles
export interface Permiso {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  accion: string;
  descripcion: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  es_super_admin: boolean;
  activo: boolean;
  permisos?: Permiso[];
  creado_en?: string;
  actualizado_en?: string;
}

// Interfaces
export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol | null;
  rol_id?: string | null;
  permisos?: string[]; // Lista de códigos de permisos o ['*'] si es super admin
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

export interface Tutor {
  id: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  especialidad?: string;
  activo: boolean;
  clases?: Clase[];
  creado_en: string;
  actualizado_en: string;
}

export interface Horario {
  id: string;
  dia: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  descripcion?: string;
  activo: boolean;
  clases?: Clase[];
  creado_en: string;
  actualizado_en: string;
}

export interface Beneficiario {
  id: string;
  codigo: string;
  nombre: string;
  apellido?: string;
  direccion?: string;
  telefono?: string;
  padre_tutor?: string;
  fecha_nacimiento?: string;
  foto_url?: string;
  correo?: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Clase {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  tutor: Tutor;
  horarios: Horario[];
  beneficiarios: Beneficiario[];
  capacidad_maxima: number;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Asistencia {
  id: string;
  clase: Clase;
  beneficiario: Beneficiario;
  fecha: string;
  estado: EstadoAsistencia;
  observaciones?: string;
  hora_registro?: string;
  sincronizado: boolean;
  creado_en: string;
  actualizado_en: string;
}

// Auth types
export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  usuario: Usuario;
}

export interface ReporteAsistenciaClase {
  clase: {
    id: string;
    nombre: string;
    codigo?: string;
    tutor: string;
    horarios: string;
  };
  periodo: {
    fechaInicio: string;
    fechaFin: string;
  };
  estadisticas: {
    totalRegistros: number;
    presentes: number;
    ausentes: number;
    justificados: number;
    tardes: number;
    porcentajeAsistencia: string;
  };
  asistenciasPorBeneficiario: any[];
}

export interface ReporteAsistenciaBeneficiario {
  beneficiario: {
    id: string;
    codigo: string;
    nombre: string;
    edad?: number;
    padre_tutor?: string;
  };
  periodo: {
    fechaInicio: string;
    fechaFin: string;
  };
  estadisticas: {
    totalClasesInscritas: number;
    totalRegistros: number;
    presentes: number;
    ausentes: number;
    justificados: number;
    tardes: number;
    porcentajeAsistencia: string;
  };
  asistenciasPorClase: any[];
}
