import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Ayuda } from './ayuda.entity';

@Entity('comentarios_ayuda')
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

  @Column({ name: 'ayuda_id' })
  ayuda_id: string;

  @CreateDateColumn()
  creado_en: Date;
}
