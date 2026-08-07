import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from './horario.entity';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { FilterHorarioDto } from './dto/filter-horario.dto';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario)
    private horariosRepository: Repository<Horario>,
  ) {}

  async create(createHorarioDto: CreateHorarioDto): Promise<Horario> {
    // Validar que hora_fin sea mayor que hora_inicio
    if (createHorarioDto.hora_inicio >= createHorarioDto.hora_fin) {
      throw new BadRequestException(
        'La hora de fin debe ser mayor que la hora de inicio',
      );
    }

    // Verificar conflictos de horario
    const conflicto = await this.verificarConflicto(
      createHorarioDto.dia,
      createHorarioDto.hora_inicio,
      createHorarioDto.hora_fin,
    );

    if (conflicto) {
      throw new BadRequestException(
        `Ya existe un horario para ${createHorarioDto.dia} que se superpone con el horario proporcionado`,
      );
    }

    const horario = this.horariosRepository.create(createHorarioDto);
    return await this.horariosRepository.save(horario);
  }

  async findAll(filters?: FilterHorarioDto): Promise<Horario[]> {
    const query = this.horariosRepository
      .createQueryBuilder('horario')
      .leftJoinAndSelect('horario.clases', 'clases')
      .orderBy('horario.dia', 'ASC')
      .addOrderBy('horario.hora_inicio', 'ASC');

    if (filters) {
      if (filters.dia) {
        query.andWhere('horario.dia = :dia', { dia: filters.dia });
      }

      if (filters.activo !== undefined) {
        query.andWhere('horario.activo = :activo', { activo: filters.activo });
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Horario> {
    const horario = await this.horariosRepository.findOne({
      where: { id },
      relations: ['clases'],
    });

    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }

    return horario;
  }

  async update(
    id: string,
    updateHorarioDto: UpdateHorarioDto,
  ): Promise<Horario> {
    const horario = await this.findOne(id);

    // Validar horas si se proporcionan ambas
    const horaInicio = updateHorarioDto.hora_inicio || horario.hora_inicio;
    const horaFin = updateHorarioDto.hora_fin || horario.hora_fin;

    if (horaInicio >= horaFin) {
      throw new BadRequestException(
        'La hora de fin debe ser mayor que la hora de inicio',
      );
    }

    // Verificar conflictos excluyendo el horario actual
    const dia = updateHorarioDto.dia || horario.dia;
    const conflicto = await this.verificarConflicto(
      dia,
      horaInicio,
      horaFin,
      id,
    );

    if (conflicto) {
      throw new BadRequestException(
        `Ya existe un horario para ${dia} que se superpone con el horario proporcionado`,
      );
    }

    Object.assign(horario, updateHorarioDto);
    return await this.horariosRepository.save(horario);
  }

  async remove(id: string): Promise<void> {
    const horario = await this.horariosRepository.findOne({
      where: { id },
      relations: ['clases'],
    });

    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }

    // Verificar que no tenga clases asignadas
    if (horario.clases && horario.clases.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el horario porque tiene ${horario.clases.length} clase(s) asignada(s)`,
      );
    }

    await this.horariosRepository.remove(horario);
  }

  async softDelete(id: string): Promise<Horario> {
    const horario = await this.findOne(id);
    horario.activo = false;
    return await this.horariosRepository.save(horario);
  }

  // Método privado para verificar conflictos de horario
  private async verificarConflicto(
    dia: string,
    horaInicio: string,
    horaFin: string,
    excluirId?: string,
  ): Promise<boolean> {
    const query = this.horariosRepository
      .createQueryBuilder('horario')
      .where('horario.dia = :dia', { dia })
      .andWhere('horario.activo = :activo', { activo: true })
      .andWhere(
        '(horario.hora_inicio < :horaFin AND horario.hora_fin > :horaInicio)',
        { horaInicio, horaFin },
      );

    if (excluirId) {
      query.andWhere('horario.id != :excluirId', { excluirId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  // Método útil para obtener horarios por día
  async findByDia(dia: string): Promise<Horario[]> {
    return await this.horariosRepository.find({
      where: { dia: dia as any, activo: true },
      order: { hora_inicio: 'ASC' },
    });
  }

  // Método para obtener horarios disponibles (sin clases asignadas)
  async findDisponibles(): Promise<Horario[]> {
    return await this.horariosRepository
      .createQueryBuilder('horario')
      .leftJoin('horario.clases', 'clases')
      .where('horario.activo = :activo', { activo: true })
      .andWhere('clases.id IS NULL')
      .orderBy('horario.dia', 'ASC')
      .addOrderBy('horario.hora_inicio', 'ASC')
      .getMany();
  }
}
