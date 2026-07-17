import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';
import { Tutor } from '../tutores/tutor.entity';
import { AsistenciaClub } from './asistencia-club.entity';

@Entity('clubes')
@Index('IDX_CLUBES_TUTOR_ID', ['tutor'])
@Index('IDX_CLUBES_CODIGO', ['codigo'])
@Index('IDX_CLUBES_ACTIVO', ['activo'])
export class Club {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 50, nullable: true })
  codigo: string;

  @ManyToOne(() => Tutor, { nullable: true, eager: true })
  @JoinColumn({ name: 'tutor_id' })
  tutor: Tutor;

  @ManyToMany(() => Beneficiario, (beneficiario) => beneficiario.clubes)
  @JoinTable({
    name: 'club_beneficiario',
    joinColumn: { name: 'club_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'beneficiario_id', referencedColumnName: 'id' },
  })
  beneficiarios: Beneficiario[];

  @OneToMany(() => AsistenciaClub, (asistencia) => asistencia.club)
  asistencias: AsistenciaClub[];

  @Column({ type: 'int', default: 0 })
  capacidad_maxima: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
