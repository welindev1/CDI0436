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
import { Club } from './club.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Entity('asistencias_club')
@Index('IDX_ASIS_CLUB_CLUB_ID', ['club'])
@Index('IDX_ASIS_CLUB_BENEFICIARIO_ID', ['beneficiario'])
@Index('IDX_ASIS_CLUB_FECHA', ['fecha'])
@Index('IDX_ASIS_CLUB_COMPOSITE', ['club', 'fecha'])
export class AsistenciaClub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Club, { nullable: false })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => Beneficiario, { nullable: false })
  @JoinColumn({ name: 'beneficiario_id' })
  beneficiario: Beneficiario;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ default: false })
  presente: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
