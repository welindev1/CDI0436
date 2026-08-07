import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PeriodoMerito } from './periodo-merito.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

export enum CicloEducativo {
  PRIMARIA = 'Primaria',
  SECUNDARIA = 'Secundaria',
}

@Entity('notas_merito')
@Index('IDX_NOTAS_MERITO_PERIODO_ID', ['periodo'])
@Index('IDX_NOTAS_MERITO_BENEFICIARIO_ID', ['beneficiario'])
@Index('IDX_NOTAS_MERITO_CICLO', ['ciclo'])
export class NotaMerito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PeriodoMerito, (periodo) => periodo.notas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'periodo_id' })
  periodo: PeriodoMerito;

  @ManyToOne(() => Beneficiario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'beneficiario_id' })
  beneficiario: Beneficiario;

  @Column({
    type: 'enum',
    enum: CicloEducativo,
  })
  ciclo: CicloEducativo;

  @Column({ type: 'int', default: 1 })
  curso: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  matematicas: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  lengua_espanola: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  naturales: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  sociales: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  promedio: number;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
