import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Clase } from '../clases/clase.entity';

@Entity('tutores')
@Index('IDX_TUTORES_CORREO', ['correo'])
@Index('IDX_TUTORES_ACTIVO', ['activo'])
@Index('IDX_TUTORES_USUARIO_ID', ['usuario'])
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
  @JoinColumn({ name: 'usuarioId' })
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
