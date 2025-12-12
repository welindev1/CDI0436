import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Clase } from './clase.entity';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { FilterClaseDto } from './dto/filter-clase.dto';
import { AgregarBeneficiariosDto } from './dto/agregar-beneficiarios.dto';
import { Tutor } from '../tutores/tutor.entity';
import { Horario } from '../horarios/horario.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Injectable()
export class ClasesService {
  constructor(
    @InjectRepository(Clase)
    private clasesRepository: Repository<Clase>,
    @InjectRepository(Tutor)
    private tutoresRepository: Repository<Tutor>,
    @InjectRepository(Horario)
    private horariosRepository: Repository<Horario>,
    @InjectRepository(Beneficiario)
    private beneficiariosRepository: Repository<Beneficiario>,
  ) {}

  async create(createClaseDto: CreateClaseDto): Promise<Clase> {
    // Verificar que el tutor existe
    const tutor = await this.tutoresRepository.findOne({
      where: { id: createClaseDto.tutorId, activo: true }
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor con ID ${createClaseDto.tutorId} no encontrado o inactivo`);
    }

    // Verificar que el horario existe
    const horario = await this.horariosRepository.findOne({
      where: { id: createClaseDto.horarioId, activo: true }
    });

    if (!horario) {
      throw new NotFoundException(`Horario con ID ${createClaseDto.horarioId} no encontrado o inactivo`);
    }

    // Verificar que no exista otra clase con el mismo tutor y horario
    const conflicto = await this.clasesRepository.findOne({
      where: {
        tutor: { id: createClaseDto.tutorId },
        horario: { id: createClaseDto.horarioId },
        activo: true
      }
    });

    if (conflicto) {
      throw new ConflictException(
        `El tutor ${tutor.nombre} ya tiene una clase asignada en este horario`
      );
    }

    // Verificar código único si se proporciona
    if (createClaseDto.codigo) {
      const codigoExiste = await this.clasesRepository.findOne({
        where: { codigo: createClaseDto.codigo }
      });

      if (codigoExiste) {
        throw new ConflictException(`Ya existe una clase con el código ${createClaseDto.codigo}`);
      }
    }

    const clase = this.clasesRepository.create({
      ...createClaseDto,
      tutor,
      horario
    });

    return await this.clasesRepository.save(clase);
  }

  async findAll(filters?: FilterClaseDto): Promise<Clase[]> {
    const query = this.clasesRepository.createQueryBuilder('clase')
      .leftJoinAndSelect('clase.tutor', 'tutor')
      .leftJoinAndSelect('clase.horario', 'horario')
      .leftJoinAndSelect('clase.beneficiarios', 'beneficiarios')
      .orderBy('clase.nombre', 'ASC');

    if (filters) {
      if (filters.nombre) {
        query.andWhere('clase.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
      }

      if (filters.codigo) {
        query.andWhere('clase.codigo ILIKE :codigo', { codigo: `%${filters.codigo}%` });
      }

      if (filters.tutorId) {
        query.andWhere('tutor.id = :tutorId', { tutorId: filters.tutorId });
      }

      if (filters.horarioId) {
        query.andWhere('horario.id = :horarioId', { horarioId: filters.horarioId });
      }

      if (filters.activo !== undefined) {
        query.andWhere('clase.activo = :activo', { activo: filters.activo });
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Clase> {
    const clase = await this.clasesRepository.findOne({
      where: { id },
      relations: ['tutor', 'tutor.usuario', 'horario', 'beneficiarios', 'asistencias']
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    return clase;
  }

  async findByCodigo(codigo: string): Promise<Clase> {
    const clase = await this.clasesRepository.findOne({
      where: { codigo },
      relations: ['tutor', 'horario', 'beneficiarios']
    });

    if (!clase) {
      throw new NotFoundException(`Clase con código ${codigo} no encontrada`);
    }

    return clase;
  }

  async update(id: string, updateClaseDto: UpdateClaseDto): Promise<Clase> {
    const clase = await this.findOne(id);

    // Si se cambia el tutor, verificar que existe
    if (updateClaseDto.tutorId && updateClaseDto.tutorId !== clase.tutor.id) {
      const tutor = await this.tutoresRepository.findOne({
        where: { id: updateClaseDto.tutorId, activo: true }
      });

      if (!tutor) {
        throw new NotFoundException(`Tutor con ID ${updateClaseDto.tutorId} no encontrado o inactivo`);
      }

      clase.tutor = tutor;
    }

    // Si se cambia el horario, verificar que existe
    if (updateClaseDto.horarioId && updateClaseDto.horarioId !== clase.horario.id) {
      const horario = await this.horariosRepository.findOne({
        where: { id: updateClaseDto.horarioId, activo: true }
      });

      if (!horario) {
        throw new NotFoundException(`Horario con ID ${updateClaseDto.horarioId} no encontrado o inactivo`);
      }

      clase.horario = horario;
    }

    // Verificar conflictos si se cambia tutor u horario
    if (updateClaseDto.tutorId || updateClaseDto.horarioId) {
      const tutorId = updateClaseDto.tutorId || clase.tutor.id;
      const horarioId = updateClaseDto.horarioId || clase.horario.id;

      const conflicto = await this.clasesRepository.createQueryBuilder('clase')
        .where('clase.id != :claseId', { claseId: id })
        .andWhere('clase.tutor.id = :tutorId', { tutorId })
        .andWhere('clase.horario.id = :horarioId', { horarioId })
        .andWhere('clase.activo = :activo', { activo: true })
        .getOne();

      if (conflicto) {
        throw new ConflictException('El tutor ya tiene una clase asignada en este horario');
      }
    }

    // Verificar código único si se cambia
    if (updateClaseDto.codigo && updateClaseDto.codigo !== clase.codigo) {
      const codigoExiste = await this.clasesRepository.findOne({
        where: { codigo: updateClaseDto.codigo }
      });

      if (codigoExiste) {
        throw new ConflictException(`Ya existe una clase con el código ${updateClaseDto.codigo}`);
      }
    }

    Object.assign(clase, updateClaseDto);
    return await this.clasesRepository.save(clase);
  }

  async remove(id: string): Promise<void> {
    const clase = await this.clasesRepository.findOne({
      where: { id },
      relations: ['beneficiarios', 'asistencias']
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    // Verificar que no tenga beneficiarios
    if (clase.beneficiarios && clase.beneficiarios.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la clase porque tiene ${clase.beneficiarios.length} beneficiario(s) inscrito(s)`
      );
    }

    await this.clasesRepository.remove(clase);
  }

  async softDelete(id: string): Promise<Clase> {
    const clase = await this.findOne(id);
    clase.activo = false;
    return await this.clasesRepository.save(clase);
  }

  // Agregar beneficiarios a la clase
  async agregarBeneficiarios(id: string, agregarBeneficiariosDto: AgregarBeneficiariosDto): Promise<Clase> {
    const clase = await this.clasesRepository.findOne({
      where: { id },
      relations: ['beneficiarios']
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    // Buscar los beneficiarios
    const beneficiarios = await this.beneficiariosRepository.find({
      where: { 
        id: In(agregarBeneficiariosDto.beneficiarioIds),
        activo: true 
      }
    });

    if (beneficiarios.length !== agregarBeneficiariosDto.beneficiarioIds.length) {
      throw new NotFoundException('Uno o más beneficiarios no fueron encontrados o están inactivos');
    }

    // Verificar capacidad máxima
    const beneficiariosActuales = clase.beneficiarios?.length || 0;
    const nuevosBeneficiarios = beneficiarios.filter(
      b => !clase.beneficiarios?.some(cb => cb.id === b.id)
    );

    if (clase.capacidad_maxima > 0) {
      const totalDespues = beneficiariosActuales + nuevosBeneficiarios.length;
      if (totalDespues > clase.capacidad_maxima) {
        throw new BadRequestException(
          `La clase solo puede tener ${clase.capacidad_maxima} beneficiarios. ` +
          `Actualmente tiene ${beneficiariosActuales} y se intentan agregar ${nuevosBeneficiarios.length}`
        );
      }
    }

    // Agregar beneficiarios sin duplicar
    clase.beneficiarios = [...(clase.beneficiarios || []), ...nuevosBeneficiarios];
    return await this.clasesRepository.save(clase);
  }

  // Remover un beneficiario de la clase
  async removerBeneficiario(id: string, beneficiarioId: string): Promise<Clase> {
    const clase = await this.clasesRepository.findOne({
      where: { id },
      relations: ['beneficiarios']
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    clase.beneficiarios = clase.beneficiarios.filter(b => b.id !== beneficiarioId);
    return await this.clasesRepository.save(clase);
  }

  // Obtener estadísticas de una clase
  async getEstadisticas(id: string): Promise<any> {
    const clase = await this.clasesRepository.findOne({
      where: { id },
      relations: ['beneficiarios', 'asistencias', 'tutor', 'horario']
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    const totalBeneficiarios = clase.beneficiarios?.length || 0;
    const totalAsistencias = clase.asistencias?.length || 0;
    const capacidadDisponible = clase.capacidad_maxima > 0 
      ? clase.capacidad_maxima - totalBeneficiarios 
      : null;

    const porcentajeOcupacion = clase.capacidad_maxima > 0
      ? ((totalBeneficiarios / clase.capacidad_maxima) * 100).toFixed(2)
      : null;

    return {
      clase: {
        id: clase.id,
        nombre: clase.nombre,
        codigo: clase.codigo,
        tutor: {
          id: clase.tutor.id,
          nombre: `${clase.tutor.nombre} ${clase.tutor.apellido || ''}`.trim()
        },
        horario: {
          id: clase.horario.id,
          dia: clase.horario.dia,
          hora_inicio: clase.horario.hora_inicio,
          hora_fin: clase.horario.hora_fin
        }
      },
      estadisticas: {
        totalBeneficiarios,
        capacidadMaxima: clase.capacidad_maxima || 'Sin límite',
        capacidadDisponible,
        porcentajeOcupacion: porcentajeOcupacion ? `${porcentajeOcupacion}%` : 'N/A',
        totalAsistenciasRegistradas: totalAsistencias
      }
    };
  }

  // Obtener clases de un tutor
  async findByTutor(tutorId: string): Promise<Clase[]> {
    return await this.clasesRepository.find({
      where: { tutor: { id: tutorId }, activo: true },
      relations: ['horario', 'beneficiarios']
    });
  }
}