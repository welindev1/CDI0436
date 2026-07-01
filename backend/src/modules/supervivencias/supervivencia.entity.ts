import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, JoinTable, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';
import { Tutor } from '../tutores/tutor.entity';

@Entity('supervivencias')
@Index('IDX_SUPERVIVENCIAS_TUTOR_ID', ['tutor'])
@Index('IDX_SUPERVIVENCIAS_CODIGO', ['codigo'])
@Index('IDX_SUPERVIVENCIAS_ACTIVO', ['activo'])
export class Supervivencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 50, nullable: true })
  codigo: string;

  @ManyToOne(() => Tutor, { nullable: true, eager: true })
  @JoinColumn({ name: 'tutor_id' })
  tutor: Tutor;

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
