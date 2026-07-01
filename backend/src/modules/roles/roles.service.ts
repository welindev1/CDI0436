import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { Permiso } from './entities/permiso.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>,
    @InjectRepository(Permiso)
    private permisosRepository: Repository<Permiso>,
  ) {}

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    // Verificar si el nombre ya existe
    const existe = await this.rolesRepository.findOne({
      where: { nombre: createRolDto.nombre },
    });

    if (existe) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }

    const rol = this.rolesRepository.create({
      nombre: createRolDto.nombre,
      descripcion: createRolDto.descripcion,
      es_super_admin: createRolDto.es_super_admin || false,
    });

    // Asignar permisos si se proporcionan
    if (createRolDto.permisos_ids?.length) {
      const permisos = await this.permisosRepository.find({
        where: { id: In(createRolDto.permisos_ids) },
      });
      rol.permisos = permisos;
    }

    return this.rolesRepository.save(rol);
  }

  async findAll(): Promise<Rol[]> {
    return this.rolesRepository.find({
      relations: ['permisos'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Rol> {
    const rol = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permisos'],
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  async findByNombre(nombre: string): Promise<Rol | null> {
    return this.rolesRepository.findOne({
      where: { nombre },
      relations: ['permisos'],
    });
  }

  async update(id: string, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);

    // Verificar si el nombre ya existe (si se está cambiando)
    if (updateRolDto.nombre && updateRolDto.nombre !== rol.nombre) {
      const existe = await this.rolesRepository.findOne({
        where: { nombre: updateRolDto.nombre },
      });
      if (existe) {
        throw new ConflictException('Ya existe un rol con ese nombre');
      }
    }

    // Actualizar campos básicos
    if (updateRolDto.nombre) rol.nombre = updateRolDto.nombre;
    if (updateRolDto.descripcion !== undefined)
      rol.descripcion = updateRolDto.descripcion;
    if (updateRolDto.es_super_admin !== undefined)
      rol.es_super_admin = updateRolDto.es_super_admin;
    if (updateRolDto.activo !== undefined) rol.activo = updateRolDto.activo;

    // Actualizar permisos si se proporcionan
    if (updateRolDto.permisos_ids !== undefined) {
      if (updateRolDto.permisos_ids.length === 0) {
        rol.permisos = [];
      } else {
        const permisos = await this.permisosRepository.find({
          where: { id: In(updateRolDto.permisos_ids) },
        });
        rol.permisos = permisos;
      }
    }

    return this.rolesRepository.save(rol);
  }

  async remove(id: string): Promise<void> {
    const rol = await this.findOne(id);

    // Verificar si es super admin
    if (rol.es_super_admin) {
      throw new BadRequestException('No se puede eliminar el rol de Super Administrador');
    }

    // Verificar si tiene usuarios asignados
    const usuariosCount = await this.rolesRepository
      .createQueryBuilder('rol')
      .leftJoin('rol.usuarios', 'usuario')
      .where('rol.id = :id', { id })
      .andWhere('usuario.id IS NOT NULL')
      .getCount();

    if (usuariosCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar el rol porque tiene usuarios asignados',
      );
    }

    await this.rolesRepository.remove(rol);
  }

  async asignarPermisos(id: string, permisosIds: string[]): Promise<Rol> {
    const rol = await this.findOne(id);

    const permisos = await this.permisosRepository.find({
      where: { id: In(permisosIds) },
    });

    rol.permisos = permisos;
    return this.rolesRepository.save(rol);
  }
}
