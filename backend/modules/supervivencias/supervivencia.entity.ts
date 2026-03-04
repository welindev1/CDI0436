import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Entity('supervivencias')
export class Supervivencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 50, nullable: true })
  codigo: string;

  @ManyToMany(() => Beneficiario, beneficiario => beneficiario.supervivencias)
  @JoinTable({
    name: 'supervivencia_beneficiario',
    joinColumn: { name: 'supervivencia_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'beneficiario_id', referencedColumnName: 'id' }
  })
  beneficiarios: Beneficiario[];

  @Column({ type: 'int', default: 0 })
  capacidad_maxima: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
