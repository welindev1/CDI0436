import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index, JoinColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

export enum TipoReporte {
  ASISTENCIA_CLASE = 'asistencia_clase',
  ASISTENCIA_ALUMNO = 'asistencia_alumno',
  ASISTENCIA_PERIODO = 'asistencia_periodo',
  ASISTENCIA_GLOBAL = 'asistencia_global',
}

export enum FormatoReporte {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

@Entity('reportes')
@Index('IDX_REPORTES_TIPO', ['tipo'])
@Index('IDX_REPORTES_FORMATO', ['formato'])
@Index('IDX_REPORTES_GENERADO_POR_ID', ['generado_por'])
export class Reporte {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TipoReporte
  })
  tipo: TipoReporte;

  @Column({
    type: 'enum',
    enum: FormatoReporte
  })
  formato: FormatoReporte;

  @Column({ type: 'json' })
  filtros: any;

  @Column({ type: 'text', nullable: true })
  ruta_archivo: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'generado_por_id' })
  generado_por: Usuario;

  @Column({ type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date;

  @CreateDateColumn()
  creado_en: Date;
}