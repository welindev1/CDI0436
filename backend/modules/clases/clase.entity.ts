import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tutor } from '../tutores/tutor.entity';
import { Horario } from '../horarios/horario.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';
import { Asistencia } from '../asistencias/asistencia.entity';

@Entity('clases')
export class Clase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 50, nullable: true })
  codigo: string;

  @ManyToOne(() => Tutor, tutor => tutor.clases)
  tutor: Tutor;

  @ManyToMany(() => Horario, horario => horario.clases)
  @JoinTable({
    name: 'clase_horario',
    joinColumn: { name: 'clase_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'horario_id', referencedColumnName: 'id' }
  })
  horarios: Horario[];

  @ManyToMany(() => Beneficiario, beneficiario => beneficiario.clases)
  @JoinTable({
    name: 'clase_beneficiario',
    joinColumn: { name: 'clase_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'beneficiario_id', referencedColumnName: 'id' }
  })
  beneficiarios: Beneficiario[];

  @OneToMany(() => Asistencia, asistencia => asistencia.clase)
  asistencias: Asistencia[];

  @Column({ type: 'int', default: 0 })
  capacidad_maxima: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}