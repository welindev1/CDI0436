import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Supervivencia } from './supervivencia.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Entity('asistencias_supervivencia')
@Index('IDX_ASIS_SUPERV_SUPERVIVENCIA_ID', ['supervivencia'])
@Index('IDX_ASIS_SUPERV_BENEFICIARIO_ID', ['beneficiario'])
@Index('IDX_ASIS_SUPERV_FECHA', ['fecha'])
@Index('IDX_ASIS_SUPERV_COMPOSITE', ['supervivencia', 'fecha'])
export class AsistenciaSupervivencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Supervivencia, { nullable: false })
  @JoinColumn({ name: 'supervivencia_id' })
  supervivencia: Supervivencia;

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
