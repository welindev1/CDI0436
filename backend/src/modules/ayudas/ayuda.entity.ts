import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TipoAyuda {
  MEDICA = 'medica',
  ALIMENTOS = 'alimentos',
  PEQUENO_NEGOCIO = 'pequeno_negocio',
  EDUCACION = 'educacion',
  OTROS = 'otros',
}

export enum EstadoAyuda {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

@Entity('ayudas')
@Index('IDX_AYUDAS_CODIGO_BENEF', ['codigo_beneficiario'])
@Index('IDX_AYUDAS_TIPO', ['tipo'])
@Index('IDX_AYUDAS_ESTADO', ['estado'])
export class Ayuda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre_beneficiario: string;

  @Column()
  codigo_beneficiario: string;

  @Column()
  nombre_madre: string;

  @Column()
  nombre_tutor: string;

  @Column({
    type: 'enum',
    enum: TipoAyuda,
  })
  tipo: TipoAyuda;

  @Column({ nullable: true })
  tipo_especificacion: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'text' })
  detalle: string;

  @Column({ type: 'text', nullable: true })
  foto_url: string;

  @Column({ type: 'text', nullable: true })
  foto_entrega_url: string;

  @Column({
    type: 'enum',
    enum: EstadoAyuda,
    default: EstadoAyuda.PENDIENTE,
  })
  estado: EstadoAyuda;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
