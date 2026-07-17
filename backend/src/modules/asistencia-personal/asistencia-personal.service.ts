import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trabajador } from './trabajador.entity';
import { AsistenciaPersonal, TurnoPersonal } from './asistencia-personal.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { CreateAsistenciaPersonalDto, MarcarSalidaDto } from './dto/create-asistencia-personal.dto';
import { FilterAsistenciaPersonalDto } from './dto/filter-asistencia-personal.dto';

@Injectable()
export class AsistenciaPersonalService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepo: Repository<Trabajador>,
    @InjectRepository(AsistenciaPersonal)
    private readonly asistenciaRepo: Repository<AsistenciaPersonal>,
  ) {}

  async createTrabajador(dto: CreateTrabajadorDto): Promise<Trabajador> {
    const trabajador = this.trabajadorRepo.create(dto);
    return await this.trabajadorRepo.save(trabajador);
  }

  async findAllTrabajadores(): Promise<Trabajador[]> {
    return await this.trabajadorRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOneTrabajador(id: string): Promise<Trabajador> {
    const trabajador = await this.trabajadorRepo.findOne({ where: { id } });
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }
    return trabajador;
  }

  async updateTrabajador(
    id: string,
    dto: CreateTrabajadorDto,
  ): Promise<Trabajador> {
    const trabajador = await this.findOneTrabajador(id);
    Object.assign(trabajador, dto);
    return await this.trabajadorRepo.save(trabajador);
  }

  async removeTrabajador(id: string): Promise<void> {
    const trabajador = await this.findOneTrabajador(id);
    await this.trabajadorRepo.remove(trabajador);
  }

  async marcarEntrada(
    trabajadorId: string,
    dto: CreateAsistenciaPersonalDto,
    registradoPorId?: string,
  ): Promise<AsistenciaPersonal> {
    const trabajador = await this.findOneTrabajador(trabajadorId);

    const fechaDate = new Date(`${dto.fecha}T12:00:00`);
    const turno = dto.turno || TurnoPersonal.MATUTINO;

    const existente = await this.asistenciaRepo.findOne({
      where: {
        trabajador: { id: trabajadorId },
        fecha: fechaDate,
        turno,
      },
    });

    if (existente) {
      throw new BadRequestException(
        `${trabajador.nombre} ya tiene registro de entrada para el ${dto.fecha} turno ${turno}`,
      );
    }

    const now = new Date();
    const horaEntrada = dto.hora_entrada ||
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const asistencia = this.asistenciaRepo.create({
      trabajador: { id: trabajadorId } as any,
      fecha: fechaDate,
      hora_entrada: horaEntrada,
      turno,
      registrado_por: registradoPorId ? ({ id: registradoPorId } as any) : undefined,
      notas: dto.notas || undefined,
    });

    return await this.asistenciaRepo.save(asistencia);
  }

  async marcarSalida(
    trabajadorId: string,
    fecha: string,
    dto: MarcarSalidaDto,
  ): Promise<AsistenciaPersonal> {
    const fechaDate = new Date(`${fecha}T12:00:00`);
    const turno = TurnoPersonal.MATUTINO;

    const asistencia = await this.asistenciaRepo.findOne({
      where: {
        trabajador: { id: trabajadorId },
        fecha: fechaDate,
        turno,
      },
    });

    if (!asistencia) {
      throw new BadRequestException(
        `No existe registro de entrada para este día. Primero marque la entrada.`,
      );
    }

    if (asistencia.hora_salida) {
      throw new BadRequestException(
        `Ya se registró salida para este día.`,
      );
    }

    asistencia.hora_salida = dto.hora_salida;
    return await this.asistenciaRepo.save(asistencia);
  }

  async findAll(
    filters?: FilterAsistenciaPersonalDto,
  ): Promise<AsistenciaPersonal[]> {
    const where: any = {};

    if (filters?.fecha) {
      where.fecha = new Date(`${filters.fecha}T12:00:00`);
    } else if (filters?.fecha_inicio && filters?.fecha_fin) {
      where.fecha = Between(
        new Date(`${filters.fecha_inicio}T00:00:00`),
        new Date(`${filters.fecha_fin}T23:59:59`),
      );
    }

    if (filters?.turno) {
      where.turno = filters.turno;
    }

    return await this.asistenciaRepo.find({
      where,
      relations: ['trabajador', 'registrado_por'],
      order: { fecha: 'DESC', hora_entrada: 'ASC' },
    });
  }

  async findByFechaAndTurno(
    fecha: string,
    turno: TurnoPersonal,
  ): Promise<AsistenciaPersonal[]> {
    const fechaDate = new Date(`${fecha}T12:00:00`);
    return await this.asistenciaRepo.find({
      where: { fecha: fechaDate, turno },
      relations: ['trabajador', 'registrado_por'],
      order: { hora_entrada: 'ASC' },
    });
  }

  async actualizarNotasDia(
    fecha: string,
    turno: TurnoPersonal | undefined,
    notas: string,
  ): Promise<AsistenciaPersonal[]> {
    const fechaDate = new Date(`${fecha}T12:00:00`);
    const where: any = { fecha: fechaDate };
    if (turno) where.turno = turno;

    const registros = await this.asistenciaRepo.find({ where });
    for (const registro of registros) {
      registro.notas = notas;
    }
    await this.asistenciaRepo.save(registros);
    return registros;
  }

  async remove(id: string): Promise<void> {
    const asistencia = await this.asistenciaRepo.findOne({ where: { id } });
    if (!asistencia) {
      throw new NotFoundException(`Registro de asistencia con ID ${id} no encontrado`);
    }
    await this.asistenciaRepo.remove(asistencia);
  }
}
