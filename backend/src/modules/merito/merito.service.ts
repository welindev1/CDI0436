import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoMerito } from './periodo-merito.entity';
import { NotaMerito, CicloEducativo } from './nota-merito.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { CreateNotaDto } from './dto/create-nota.dto';

@Injectable()
export class MeritoService {
  constructor(
    @InjectRepository(PeriodoMerito)
    private readonly periodoRepository: Repository<PeriodoMerito>,
    @InjectRepository(NotaMerito)
    private readonly notaRepository: Repository<NotaMerito>,
    @InjectRepository(Beneficiario)
    private readonly beneficiarioRepository: Repository<Beneficiario>,
  ) {}

  // --- PERIODOS ---
  async createPeriodo(
    createPeriodoDto: CreatePeriodoDto,
  ): Promise<PeriodoMerito> {
    const nuevoPeriodo = this.periodoRepository.create(createPeriodoDto);
    return await this.periodoRepository.save(nuevoPeriodo);
  }

  async findAllPeriodos(): Promise<PeriodoMerito[]> {
    return await this.periodoRepository.find({
      order: { anio: 'DESC', creado_en: 'DESC' },
    });
  }

  async findPeriodoById(id: string): Promise<PeriodoMerito> {
    const periodo = await this.periodoRepository.findOne({ where: { id } });
    if (!periodo) throw new NotFoundException('Periodo no encontrado');
    return periodo;
  }

  async deletePeriodo(id: string): Promise<{ success: boolean }> {
    const periodo = await this.findPeriodoById(id);
    await this.periodoRepository.remove(periodo);
    return { success: true };
  }

  // --- NOTAS ---
  async agregarNota(
    periodo_id: string,
    createNotaDto: CreateNotaDto,
  ): Promise<NotaMerito> {
    const periodo = await this.findPeriodoById(periodo_id);
    if (periodo.estado !== 'activo') {
      throw new BadRequestException('El periodo está cerrado');
    }

    const beneficiario = await this.beneficiarioRepository.findOne({
      where: { id: createNotaDto.beneficiario_id },
    });
    if (!beneficiario)
      throw new NotFoundException('Beneficiario no encontrado');

    // Verificar si ya tiene nota
    const notaExistente = await this.notaRepository.findOne({
      where: {
        periodo: { id: periodo_id },
        beneficiario: { id: createNotaDto.beneficiario_id },
      },
    });

    if (notaExistente) {
      const promedio =
        (createNotaDto.matematicas +
          createNotaDto.lengua_espanola +
          createNotaDto.naturales +
          createNotaDto.sociales) /
        4;

      notaExistente.ciclo = createNotaDto.ciclo;
      notaExistente.curso = createNotaDto.curso;
      notaExistente.matematicas = createNotaDto.matematicas;
      notaExistente.lengua_espanola = createNotaDto.lengua_espanola;
      notaExistente.naturales = createNotaDto.naturales;
      notaExistente.sociales = createNotaDto.sociales;
      notaExistente.promedio = promedio;

      return await this.notaRepository.save(notaExistente);
    }

    const promedio =
      (createNotaDto.matematicas +
        createNotaDto.lengua_espanola +
        createNotaDto.naturales +
        createNotaDto.sociales) /
      4;

    const nuevaNota = this.notaRepository.create({
      periodo,
      beneficiario,
      ciclo: createNotaDto.ciclo,
      curso: createNotaDto.curso,
      matematicas: createNotaDto.matematicas,
      lengua_espanola: createNotaDto.lengua_espanola,
      naturales: createNotaDto.naturales,
      sociales: createNotaDto.sociales,
      promedio,
    });

    return await this.notaRepository.save(nuevaNota);
  }

  async getDashboardPeriodo(periodo_id: string) {
    const periodo = await this.findPeriodoById(periodo_id);

    // Obtener todos los beneficiarios activos
    const todosBeneficiarios = await this.beneficiarioRepository.find({
      where: { activo: true },
    });

    // Obtener notas registradas en este periodo
    const notasRegistradas = await this.notaRepository.find({
      where: { periodo: { id: periodo_id } },
      relations: ['beneficiario'],
    });

    const idsConNota = notasRegistradas.map((n) => n.beneficiario.id);
    const faltanPorEntregar = todosBeneficiarios.filter(
      (b) => !idsConNota.includes(b.id),
    );

    return {
      periodo,
      faltan_por_entregar: faltanPorEntregar.map((b) => ({
        id: b.id,
        codigo: b.codigo,
        nombre: b.nombre,
        apellido: b.apellido,
      })),
      notas_registradas: notasRegistradas.map((n) => ({
        id: n.id,
        beneficiario_id: n.beneficiario.id,
        codigo: n.beneficiario.codigo,
        nombre: n.beneficiario.nombre,
        apellido: n.beneficiario.apellido,
        ciclo: n.ciclo,
        curso: n.curso,
        promedio: n.promedio,
        matematicas: n.matematicas,
        lengua_espanola: n.lengua_espanola,
        naturales: n.naturales,
        sociales: n.sociales,
      })),
    };
  }

  async getGanadores(
    periodo_id: string,
    cant_primaria: number,
    cant_secundaria: number,
    min_primaria?: number,
    max_primaria?: number,
    min_secundaria?: number,
    max_secundaria?: number,
  ) {
    await this.findPeriodoById(periodo_id); // Valida que exista

    const useRangePrimaria =
      min_primaria !== undefined && max_primaria !== undefined;
    const useRangeSecundaria =
      min_secundaria !== undefined && max_secundaria !== undefined;

    let primaria: NotaMerito[];
    let secundaria: NotaMerito[];

    if (useRangePrimaria) {
      primaria = await this.notaRepository
        .createQueryBuilder('nota')
        .innerJoinAndSelect('nota.beneficiario', 'beneficiario')
        .where('nota.periodo_id = :periodo_id', { periodo_id })
        .andWhere('nota.ciclo = :ciclo', { ciclo: CicloEducativo.PRIMARIA })
        .andWhere('nota.promedio >= :min AND nota.promedio <= :max', {
          min: min_primaria,
          max: max_primaria,
        })
        .orderBy('nota.promedio', 'DESC')
        .getMany();
    } else {
      primaria = await this.notaRepository.find({
        where: { periodo: { id: periodo_id }, ciclo: CicloEducativo.PRIMARIA },
        relations: ['beneficiario'],
        order: { promedio: 'DESC' },
        take: cant_primaria,
      });
    }

    if (useRangeSecundaria) {
      secundaria = await this.notaRepository
        .createQueryBuilder('nota')
        .innerJoinAndSelect('nota.beneficiario', 'beneficiario')
        .where('nota.periodo_id = :periodo_id', { periodo_id })
        .andWhere('nota.ciclo = :ciclo', { ciclo: CicloEducativo.SECUNDARIA })
        .andWhere('nota.promedio >= :min AND nota.promedio <= :max', {
          min: min_secundaria,
          max: max_secundaria,
        })
        .orderBy('nota.promedio', 'DESC')
        .getMany();
    } else {
      secundaria = await this.notaRepository.find({
        where: {
          periodo: { id: periodo_id },
          ciclo: CicloEducativo.SECUNDARIA,
        },
        relations: ['beneficiario'],
        order: { promedio: 'DESC' },
        take: cant_secundaria,
      });
    }

    return {
      primaria: primaria.map((n) => ({
        id: n.beneficiario.id,
        codigo: n.beneficiario.codigo,
        nombre: `${n.beneficiario.nombre} ${n.beneficiario.apellido || ''}`,
        curso: n.curso,
        promedio: n.promedio,
      })),
      secundaria: secundaria.map((n) => ({
        id: n.beneficiario.id,
        codigo: n.beneficiario.codigo,
        nombre: `${n.beneficiario.nombre} ${n.beneficiario.apellido || ''}`,
        curso: n.curso,
        promedio: n.promedio,
      })),
    };
  }
}
