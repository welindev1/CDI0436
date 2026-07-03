import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Clase } from '../clases/clase.entity';

@Entity('fotos_asistencia')
@Index('IDX_FOTOS_ASIST_CLASE_FECHA', ['clase', 'fecha'])
@Index('IDX_FOTOS_ASIST_CLASE_ID', ['clase'])
@Index('IDX_FOTOS_ASIST_FECHA', ['fecha'])
export class FotoAsistencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Clase, { eager: true, onDelete: 'CASCADE' })
  clase: Clase;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'text' })
  imagen_url: string; // Ahora guarda Base64 en lugar de URL de archivo

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre_original: string;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
