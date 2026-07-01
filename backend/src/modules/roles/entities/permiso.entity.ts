import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, Index } from 'typeorm';
import { Rol } from './rol.entity';

@Entity('permisos')
@Index('IDX_PERMISOS_MODULO', ['modulo'])
export class Permiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  codigo: string; // Ej: 'usuarios:ver', 'beneficiarios:crear'

  @Column({ length: 100 })
  nombre: string; // Ej: 'Ver usuarios', 'Crear beneficiarios'

  @Column({ length: 50 })
  modulo: string; // Ej: 'usuarios', 'beneficiarios', 'clases'

  @Column({ length: 50 })
  accion: string; // Ej: 'ver', 'crear', 'editar', 'eliminar'

  @Column({ nullable: true, length: 255 })
  descripcion: string;

  @ManyToMany(() => Rol, (rol) => rol.permisos)
  roles: Rol[];
}
