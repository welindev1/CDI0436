import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Clase } from '../clases/clase.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum EstadoAsistencia {
  PRESENTE = 'presente',
  AUSENTE = 'ausente',
}

@Entity('asistencias')
@Index(['clase', 'beneficiario', 'fecha'], { unique: true })
export class Asistencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Clase, clase => clase.asistencias, { eager: true })
  clase: Clase;

  @ManyToOne(() => Beneficiario, beneficiario => beneficiario.asistencias, { eager: true })
  beneficiario: Beneficiario;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({
    type: 'enum',
    enum: EstadoAsistencia,
    default: EstadoAsistencia.AUSENTE
  })
  estado: EstadoAsistencia;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'time', nullable: true })
  hora_registro: string;

  @ManyToOne(() => Usuario, { nullable: true })
  registrado_por: Usuario;

  @Column({ type: 'boolean', default: false })
  sincronizado: boolean;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}