import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { NotaMerito } from './nota-merito.entity';

@Entity('periodos_merito')
@Index('IDX_PERIODOS_MERITO_ANIO', ['anio'])
@Index('IDX_PERIODOS_MERITO_ESTADO', ['estado'])
export class PeriodoMerito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string; // Ej: "Mérito Estudiantil 2026"

  @Column()
  anio: number;

  @Column({ default: 'activo' })
  estado: string; // 'activo' | 'cerrado'

  @OneToMany(() => NotaMerito, nota => nota.periodo)
  notas: NotaMerito[];

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
