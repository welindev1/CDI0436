import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TipoAyuda {
  MEDICA = 'medica',
  ALIMENTOS = 'alimentos',
  OTROS = 'otros',
}

export enum EstadoAyuda {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

@Entity('ayudas')
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

  @Column({ type: 'text' })
  detalle: string;

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
