import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutor } from './tutor.entity';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { FilterTutorDto } from './dto/filter-tutor.dto';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class TutoresService {
  constructor(
    @InjectRepository(Tutor)
    private tutoresRepository: Repository<Tutor>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createTutorDto: CreateTutorDto): Promise<Tutor> {
    const tutor = this.tutoresRepository.create(createTutorDto);

    // Si se proporciona un usuarioId, verificar que existe
    if (createTutorDto.usuarioId) {
      const usuario = await this.usuariosRepository.findOne({
        where: { id: createTutorDto.usuarioId },
      });
      if (!usuario) {
        throw new NotFoundException(
          `Usuario con ID ${createTutorDto.usuarioId} no encontrado`,
        );
      }
      tutor.usuario = usuario;
    }

    return await this.tutoresRepository.save(tutor);
  }

  async findAll(filters?: FilterTutorDto): Promise<Tutor[]> {
    const query = this.tutoresRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.usuario', 'usuario')
      .leftJoinAndSelect('tutor.clases', 'clases');

    if (filters) {
      if (filters.nombre) {
        query.andWhere('tutor.nombre ILIKE :nombre', {
          nombre: `%${filters.nombre}%`,
        });
      }

      if (filters.correo) {
        query.andWhere('tutor.correo ILIKE :correo', {
          correo: `%${filters.correo}%`,
        });
      }

      if (filters.especialidad) {
        query.andWhere('tutor.especialidad ILIKE :especialidad', {
          especialidad: `%${filters.especialidad}%`,
        });
      }

      if (filters.activo !== undefined) {
        query.andWhere('tutor.activo = :activo', { activo: filters.activo });
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Tutor> {
    const tutor = await this.tutoresRepository.findOne({
      where: { id },
      relations: ['usuario', 'clases'],
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor con ID ${id} no encontrado`);
    }

    return tutor;
  }

  async update(id: string, updateTutorDto: UpdateTutorDto): Promise<Tutor> {
    const tutor = await this.findOne(id);

    // Si se proporciona un nuevo usuarioId, verificar que existe
    if (updateTutorDto.usuarioId) {
      const usuario = await this.usuariosRepository.findOne({
        where: { id: updateTutorDto.usuarioId },
      });
      if (!usuario) {
        throw new NotFoundException(
          `Usuario con ID ${updateTutorDto.usuarioId} no encontrado`,
        );
      }
      tutor.usuario = usuario;
    }

    Object.assign(tutor, updateTutorDto);
    return await this.tutoresRepository.save(tutor);
  }

  async remove(id: string): Promise<void> {
    const tutor = await this.tutoresRepository.findOne({
      where: { id },
      relations: ['clases'],
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor con ID ${id} no encontrado`);
    }

    // Verificar que no tenga clases asignadas
    if (tutor.clases && tutor.clases.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el tutor porque tiene ${tutor.clases.length} clase(s) asignada(s)`,
      );
    }

    await this.tutoresRepository.remove(tutor);
  }

  async softDelete(id: string): Promise<Tutor> {
    const tutor = await this.findOne(id);
    tutor.activo = false;
    return await this.tutoresRepository.save(tutor);
  }
}
