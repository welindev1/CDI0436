import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Trabajador } from './trabajador.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum TurnoPersonal {
  MATUTINO = 'matutino',
  VESPERTINO = 'vespertino',
}

@Entity('asistencia_personal')
@Index('IDX_ASIST_PERSONAL_COMPOSITE', ['trabajador', 'fecha'])
@Index('IDX_ASIST_PERSONAL_TRABAJADOR', ['trabajador'])
@Index('IDX_ASIST_PERSONAL_FECHA', ['fecha'])
export class AsistenciaPersonal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Trabajador, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time', nullable: true })
  hora_entrada: string;

  @Column({ type: 'time', nullable: true })
  hora_salida: string;

  @Column({
    type: 'enum',
    enum: TurnoPersonal,
    default: TurnoPersonal.MATUTINO,
  })
  turno: TurnoPersonal;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'registrado_por_id' })
  registrado_por: Usuario;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
