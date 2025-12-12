import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Clase } from '../clases/clase.entity';

@Entity('tutores')
export class Tutor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100, nullable: true })
  apellido: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  correo: string;

  @Column({ type: 'text', nullable: true })
  especialidad: string;

  @OneToOne(() => Usuario, { nullable: true })
  @JoinColumn()
  usuario: Usuario;

  @OneToMany(() => Clase, clase => clase.tutor)
  clases: Clase[];

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
