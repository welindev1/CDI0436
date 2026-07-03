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
import { Supervivencia } from './supervivencia.entity';

@Entity('fotos_asistencia_supervivencia')
@Index('IDX_FOTOS_SUPERV_COMPOSITE', ['supervivencia', 'fecha'])
@Index('IDX_FOTOS_SUPERV_SUPERVIVENCIA_ID', ['supervivencia'])
@Index('IDX_FOTOS_SUPERV_FECHA', ['fecha'])
export class FotoAsistenciaSupervivencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Supervivencia, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supervivencia_id' })
  supervivencia: Supervivencia;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'text' })
  imagen_url: string; // Guarda Base64

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre_original: string;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
