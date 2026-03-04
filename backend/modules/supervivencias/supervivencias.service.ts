import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Supervivencia } from './supervivencia.entity';
import { CreateSupervivenciaDto } from './dto/create-supervivencia.dto';
import { UpdateSupervivenciaDto } from './dto/update-supervivencia.dto';
import { FilterSupervivenciaDto } from './dto/filter-supervivencia.dto';
import { AgregarBeneficiariosSupervivenciaDto } from './dto/agregar-beneficiarios.dto';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Injectable()
export class SupervivenciasService {
  constructor(
    @InjectRepository(Supervivencia)
    private supervivenciasRepository: Repository<Supervivencia>,
    @InjectRepository(Beneficiario)
    private beneficiariosRepository: Repository<Beneficiario>,
  ) {}

  async create(createSupervivenciaDto: CreateSupervivenciaDto): Promise<Supervivencia> {
    if (createSupervivenciaDto.codigo) {
      const codigoExiste = await this.supervivenciasRepository.findOne({
        where: { codigo: createSupervivenciaDto.codigo }
      });

      if (codigoExiste) {
        throw new ConflictException(`Ya existe un curso de supervivencia con el código ${createSupervivenciaDto.codigo}`);
      }
    }

    const supervivencia = this.supervivenciasRepository.create(createSupervivenciaDto);
    return await this.supervivenciasRepository.save(supervivencia);
  }

  async findAll(filters?: FilterSupervivenciaDto): Promise<Supervivencia[]> {
    const query = this.supervivenciasRepository.createQueryBuilder('supervivencia')
      .leftJoinAndSelect('supervivencia.beneficiarios', 'beneficiarios')
      .orderBy('supervivencia.nombre', 'ASC');

    if (filters) {
      if (filters.nombre) {
        query.andWhere('supervivencia.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
      }

      if (filters.codigo) {
        query.andWhere('supervivencia.codigo ILIKE :codigo', { codigo: `%${filters.codigo}%` });
      }

      if (filters.activo !== undefined) {
        query.andWhere('supervivencia.activo = :activo', { activo: filters.activo });
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Supervivencia> {
    const supervivencia = await this.supervivenciasRepository.findOne({
      where: { id },
      relations: ['beneficiarios']
    });

    if (!supervivencia) {
      throw new NotFoundException(`Curso de supervivencia con ID ${id} no encontrado`);
    }

    return supervivencia;
  }

  async findByCodigo(codigo: string): Promise<Supervivencia> {
    const supervivencia = await this.supervivenciasRepository.findOne({
      where: { codigo },
      relations: ['beneficiarios']
    });

    if (!supervivencia) {
      throw new NotFoundException(`Curso de supervivencia con código ${codigo} no encontrado`);
    }

    return supervivencia;
  }

  async update(id: string, updateSupervivenciaDto: UpdateSupervivenciaDto): Promise<Supervivencia> {
    const supervivencia = await this.findOne(id);

    if (updateSupervivenciaDto.codigo && updateSupervivenciaDto.codigo !== supervivencia.codigo) {
      const codigoExiste = await this.supervivenciasRepository.findOne({
        where: { codigo: updateSupervivenciaDto.codigo }
      });

      if (codigoExiste) {
        throw new ConflictException(`Ya existe un curso de supervivencia con el código ${updateSupervivenciaDto.codigo}`);
      }
    }

    Object.assign(supervivencia, updateSupervivenciaDto);
    return await this.supervivenciasRepository.save(supervivencia);
  }

  async remove(id: string): Promise<void> {
    const supervivencia = await this.supervivenciasRepository.findOne({
      where: { id },
      relations: ['beneficiarios']
    });

    if (!supervivencia) {
      throw new NotFoundException(`Curso de supervivencia con ID ${id} no encontrado`);
    }

    // Verificar que no tenga beneficiarios
    if (supervivencia.beneficiarios && supervivencia.beneficiarios.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el curso porque tiene ${supervivencia.beneficiarios.length} beneficiario(s) inscrito(s)`
      );
    }

    await this.supervivenciasRepository.remove(supervivencia);
  }

  async softDelete(id: string): Promise<Supervivencia> {
    const supervivencia = await this.findOne(id);
    supervivencia.activo = false;
    return await this.supervivenciasRepository.save(supervivencia);
  }

  // Agregar beneficiarios al curso de supervivencia
  async agregarBeneficiarios(id: string, agregarBeneficiariosDto: AgregarBeneficiariosSupervivenciaDto): Promise<Supervivencia> {
    const supervivencia = await this.supervivenciasRepository.findOne({
      where: { id },
      relations: ['beneficiarios']
    });

    if (!supervivencia) {
      throw new NotFoundException(`Curso de supervivencia con ID ${id} no encontrado`);
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
    const beneficiariosActuales = supervivencia.beneficiarios?.length || 0;
    const nuevosBeneficiarios = beneficiarios.filter(
      b => !supervivencia.beneficiarios?.some(cb => cb.id === b.id)
    );

    if (supervivencia.capacidad_maxima > 0) {
      const totalDespues = beneficiariosActuales + nuevosBeneficiarios.length;
      if (totalDespues > supervivencia.capacidad_maxima) {
        throw new BadRequestException(
          `El curso solo puede tener ${supervivencia.capacidad_maxima} beneficiarios. ` +
          `Actualmente tiene ${beneficiariosActuales} y se intentan agregar ${nuevosBeneficiarios.length}`
        );
      }
    }

    // Agregar beneficiarios sin duplicar
    supervivencia.beneficiarios = [...(supervivencia.beneficiarios || []), ...nuevosBeneficiarios];
    return await this.supervivenciasRepository.save(supervivencia);
  }

  // Remover un beneficiario del curso de supervivencia
  async removerBeneficiario(id: string, beneficiarioId: string): Promise<Supervivencia> {
    const supervivencia = await this.supervivenciasRepository.findOne({
      where: { id },
      relations: ['beneficiarios']
    });

    if (!supervivencia) {
      throw new NotFoundException(`Curso de supervivencia con ID ${id} no encontrado`);
    }

    supervivencia.beneficiarios = supervivencia.beneficiarios.filter(b => b.id !== beneficiarioId);
    return await this.supervivenciasRepository.save(supervivencia);
  }

  // Obtener estadísticas de un curso de supervivencia
  async getEstadisticas(id: string): Promise<any> {
    const supervivencia = await this.supervivenciasRepository.findOne({
      where: { id },
      relations: ['beneficiarios']
    });

    if (!supervivencia) {
      throw new NotFoundException(`Curso de supervivencia con ID ${id} no encontrado`);
    }

    const totalBeneficiarios = supervivencia.beneficiarios?.length || 0;
    const capacidadDisponible = supervivencia.capacidad_maxima > 0
      ? supervivencia.capacidad_maxima - totalBeneficiarios
      : null;

    const porcentajeOcupacion = supervivencia.capacidad_maxima > 0
      ? ((totalBeneficiarios / supervivencia.capacidad_maxima) * 100).toFixed(2)
      : null;

    return {
      supervivencia: {
        id: supervivencia.id,
        nombre: supervivencia.nombre,
        codigo: supervivencia.codigo,
      },
      estadisticas: {
        totalBeneficiarios,
        capacidadMaxima: supervivencia.capacidad_maxima || 'Sin límite',
        capacidadDisponible,
        porcentajeOcupacion: porcentajeOcupacion ? `${porcentajeOcupacion}%` : 'N/A',
      }
    };
  }
}
