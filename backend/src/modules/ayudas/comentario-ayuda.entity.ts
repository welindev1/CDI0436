import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ayuda } from './ayuda.entity';

@Entity('comentarios_ayuda')
@Index('IDX_COMENTARIOS_AYUDA_ID', ['ayuda'])
export class ComentarioAyuda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ length: 100 })
  autor: string;

  @ManyToOne(() => Ayuda, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ayuda_id' })
  ayuda: Ayuda;

  ayuda_id: string; // FK expuesta (TypeORM la gestiona vía @JoinColumn)

  @CreateDateColumn()
  creado_en: Date;
}
