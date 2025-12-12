import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RolUsuario {
  ADMINISTRADOR = 'administrador',
  PROFESOR = 'profesor',
  TUTOR_LIDER = 'tutor_lider',
  TUTOR = 'tutor',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 100 })
  correo: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.TUTOR,
  })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
