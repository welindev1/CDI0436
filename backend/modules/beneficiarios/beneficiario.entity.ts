import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Clase } from '../clases/clase.entity';
import { Asistencia } from '../asistencias/asistencia.entity';
import { Supervivencia } from '../supervivencias/supervivencia.entity';

@Entity('beneficiarios')
export class Beneficiario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100, nullable: true })
  apellido: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  padre_tutor: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ type: 'text', nullable: true })
  foto_url: string;

  @Column({ length: 100, nullable: true })
  correo: string;

  @ManyToMany(() => Clase, clase => clase.beneficiarios)
  clases: Clase[];

  @ManyToMany(() => Supervivencia, supervivencia => supervivencia.beneficiarios)
  supervivencias: Supervivencia[];

  @OneToMany(() => Asistencia, asistencia => asistencia.beneficiario)
  asistencias: Asistencia[];

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}