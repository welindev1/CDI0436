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
import { Rol } from '../roles/entities/rol.entity';

@Entity('usuarios')
@Index('IDX_USUARIOS_ROL_ID', ['rol_id'])
@Index('IDX_USUARIOS_ACTIVO', ['activo'])
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 100 })
  correo: string;

  @Column()
  password_hash: string;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @Column({ nullable: true })
  rol_id: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ default: true })
  primer_login: boolean;


  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;

  // Helper para verificar si tiene un permiso específico
  tienePermiso(codigoPermiso: string): boolean {
    if (!this.rol) return false;
    if (this.rol.es_super_admin) return true;
    return this.rol.permisos?.some((p) => p.codigo === codigoPermiso) ?? false;
  }
}
