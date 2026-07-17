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

@Entity('fotos_asistencia_club')
@Index('IDX_FOTOS_CLUB_COMPOSITE', ['club', 'fecha'])
@Index('IDX_FOTOS_CLUB_CLUB_ID', ['club'])
@Index('IDX_FOTOS_CLUB_FECHA', ['fecha'])
export class FotoAsistenciaClub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Club, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'text' })
  imagen_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre_original: string;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
