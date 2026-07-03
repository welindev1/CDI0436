import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TandaNutricion {
  MATUTINA = 'matutina',
  VESPERTINA = 'vespertina',
}

@Entity('menus_nutricion')
@Index(['fecha', 'tanda'], { unique: true })
export class MenuNutricion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({
    type: 'enum',
    enum: TandaNutricion,
  })
  tanda: TandaNutricion;

  @Column({ type: 'varchar', length: 255 })
  titulo_menu: string;

  @Column({ type: 'int', nullable: true })
  meriendas_servidas: number | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
