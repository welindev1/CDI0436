import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
} from 'typeorm';
import { Permiso } from './permiso.entity';
import { Usuario } from '../../usuarios/usuario.entity';

@Entity('roles')
@Index('IDX_ROLES_ACTIVO', ['activo'])
@Index('IDX_ROLES_SUPER_ADMIN', ['es_super_admin'])
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @Column({ nullable: true, length: 255 })
  descripcion: string;

  @Column({ default: false })
  es_super_admin: boolean; // Si es true, tiene todos los permisos automáticamente

  @Column({ default: true })
  activo: boolean;

  @ManyToMany(() => Permiso, (permiso) => permiso.roles, { eager: true })
  @JoinTable({
    name: 'roles_permisos',
    joinColumn: { name: 'rol_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permiso_id', referencedColumnName: 'id' },
  })
  permisos: Permiso[];

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
