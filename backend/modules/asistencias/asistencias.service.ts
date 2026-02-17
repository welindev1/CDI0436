import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Asistencia, EstadoAsistencia } from './asistencia.entity';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { FilterAsistenciaDto } from './dto/filter-asistencia.dto';
import { RegistrarAsistenciaMasivaDto } from './dto/registrar-asistencia-masiva.dto';
import { MarcarTodosDto } from './dto/marcar-todos.dto';
import { JustificarMasivoDto } from './dto/justificar-masivo.dto';
import { Clase } from '../clases/clase.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private asistenciasRepository: Repository<Asistencia>,
    @InjectRepository(Clase)
    private clasesRepository: Repository<Clase>,
    @InjectRepository(Beneficiario)
    private beneficiariosRepository: Repository<Beneficiario>,
  ) {}

  async create(createAsistenciaDto: CreateAsistenciaDto): Promise<Asistencia> {
    // Verificar que la clase existe
    const clase = await this.clasesRepository.findOne({
      where: { id: createAsistenciaDto.claseId, activo: true }
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${createAsistenciaDto.claseId} no encontrada`);
    }

    // Verificar que el beneficiario existe y está inscrito en la clase
    const beneficiario = await this.beneficiariosRepository.findOne({
      where: { id: createAsistenciaDto.beneficiarioId, activo: true },
      relations: ['clases']
    });

    if (!beneficiario) {
      throw new NotFoundException(`Beneficiario con ID ${createAsistenciaDto.beneficiarioId} no encontrado`);
    }

    const estaInscrito = beneficiario.clases.some(c => c.id === createAsistenciaDto.claseId);
    if (!estaInscrito) {
      throw new BadRequestException('El beneficiario no está inscrito en esta clase');
    }

    // Verificar que no exista registro duplicado
    const existente = await this.asistenciasRepository.findOne({
      where: {
        clase: { id: createAsistenciaDto.claseId },
        beneficiario: { id: createAsistenciaDto.beneficiarioId },
        fecha: new Date(createAsistenciaDto.fecha)
      }
    });

    if (existente) {
      throw new ConflictException('Ya existe un registro de asistencia para este beneficiario en esta fecha');
    }

    // Establecer hora de registro si no se proporciona
    const horaRegistro = createAsistenciaDto.hora_registro || 
      new Date().toTimeString().split(' ')[0].substring(0, 5);

    const asistencia = this.asistenciasRepository.create({
      ...createAsistenciaDto,
      clase,
      beneficiario,
      fecha: new Date(createAsistenciaDto.fecha),
      hora_registro: horaRegistro
    });

    return await this.asistenciasRepository.save(asistencia);
  }

  async findAll(filters?: FilterAsistenciaDto): Promise<Asistencia[]> {
    const query = this.asistenciasRepository.createQueryBuilder('asistencia')
      .leftJoinAndSelect('asistencia.clase', 'clase')
      .leftJoinAndSelect('asistencia.beneficiario', 'beneficiario')
      .leftJoinAndSelect('clase.tutor', 'tutor')
      .leftJoinAndSelect('clase.horario', 'horario')
      .orderBy('asistencia.fecha', 'DESC')
      .addOrderBy('asistencia.hora_registro', 'DESC');

    if (filters) {
      if (filters.claseId) {
        query.andWhere('clase.id = :claseId', { claseId: filters.claseId });
      }

      if (filters.beneficiarioId) {
        query.andWhere('beneficiario.id = :beneficiarioId', { beneficiarioId: filters.beneficiarioId });
      }

      if (filters.estado) {
        query.andWhere('asistencia.estado = :estado', { estado: filters.estado });
      }

      if (filters.fechaInicio && filters.fechaFin) {
        query.andWhere('asistencia.fecha BETWEEN :fechaInicio AND :fechaFin', {
          fechaInicio: filters.fechaInicio,
          fechaFin: filters.fechaFin
        });
      } else if (filters.fechaInicio) {
        query.andWhere('asistencia.fecha >= :fechaInicio', { fechaInicio: filters.fechaInicio });
      } else if (filters.fechaFin) {
        query.andWhere('asistencia.fecha <= :fechaFin', { fechaFin: filters.fechaFin });
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Asistencia> {
    const asistencia = await this.asistenciasRepository.findOne({
      where: { id },
      relations: ['clase', 'beneficiario', 'clase.tutor', 'clase.horario', 'registrado_por']
    });

    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }

    return asistencia;
  }

  async update(id: string, updateAsistenciaDto: UpdateAsistenciaDto): Promise<Asistencia> {
    const asistencia = await this.findOne(id);

    Object.assign(asistencia, updateAsistenciaDto);
    return await this.asistenciasRepository.save(asistencia);
  }

  async remove(id: string): Promise<void> {
    const asistencia = await this.findOne(id);
    await this.asistenciasRepository.remove(asistencia);
  }

  // Registrar asistencia masiva (toda la clase)
  async registrarAsistenciaMasiva(dto: RegistrarAsistenciaMasivaDto): Promise<Asistencia[]> {
    // Verificar que la clase existe
    const clase = await this.clasesRepository.findOne({
      where: { id: dto.claseId, activo: true },
      relations: ['beneficiarios']
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${dto.claseId} no encontrada`);
    }

    // Verificar que todos los beneficiarios pertenecen a la clase
    const beneficiarioIds = dto.asistencias.map(a => a.beneficiarioId);
    const beneficiariosClase = clase.beneficiarios.map(b => b.id);

    const noInscritos = beneficiarioIds.filter(id => !beneficiariosClase.includes(id));
    if (noInscritos.length > 0) {
      throw new BadRequestException(`Algunos beneficiarios no están inscritos en esta clase: ${noInscritos.join(', ')}`);
    }

    const fecha = new Date(dto.fecha);
    const horaRegistro = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Eliminar registros existentes para esta clase y fecha
    await this.asistenciasRepository.delete({
      clase: { id: dto.claseId },
      fecha: fecha
    });

    // Crear nuevos registros
    const asistencias = dto.asistencias.map(a => {
      const beneficiario = clase.beneficiarios.find(b => b.id === a.beneficiarioId);
      return this.asistenciasRepository.create({
        clase,
        beneficiario,
        fecha,
        estado: a.estado,
        observaciones: a.observaciones,
        hora_registro: horaRegistro
      });
    });

    return await this.asistenciasRepository.save(asistencias);
  }

  // Marcar asistencia para todos los beneficiarios de una clase
  async marcarTodos(dto: MarcarTodosDto): Promise<Asistencia[]> {
    const clase = await this.clasesRepository.findOne({
      where: { id: dto.claseId, activo: true },
      relations: ['beneficiarios']
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${dto.claseId} no encontrada`);
    }

    if (!clase.beneficiarios || clase.beneficiarios.length === 0) {
      throw new BadRequestException('La clase no tiene beneficiarios inscritos');
    }

    const fecha = new Date(dto.fecha);
    const horaRegistro = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Eliminar registros existentes
    await this.asistenciasRepository.delete({
      clase: { id: dto.claseId },
      fecha: fecha
    });

    // Crear registros para todos los beneficiarios
    const asistencias = clase.beneficiarios.map(beneficiario =>
      this.asistenciasRepository.create({
        clase,
        beneficiario,
        fecha,
        estado: dto.estado,
        observaciones: dto.observaciones,
        hora_registro: horaRegistro
      })
    );

    return await this.asistenciasRepository.save(asistencias);
  }

  // Justificar ausencias masivamente
  async justificarMasivo(dto: JustificarMasivoDto): Promise<Asistencia[]> {
    const fecha = new Date(dto.fecha);

    const asistencias = await this.asistenciasRepository.find({
      where: {
        clase: { id: dto.claseId },
        beneficiario: { id: In(dto.beneficiarioIds) },
        fecha: fecha,
        estado: EstadoAsistencia.AUSENTE
      }
    });

    if (asistencias.length === 0) {
      throw new NotFoundException('No se encontraron ausencias para justificar');
    }

    asistencias.forEach(asistencia => {
      asistencia.estado = EstadoAsistencia.JUSTIFICADO;
      asistencia.observaciones = dto.observaciones || asistencia.observaciones;
    });

    return await this.asistenciasRepository.save(asistencias);
  }

  // Obtener asistencia por clase y fecha
  async findByClaseYFecha(claseId: string, fecha: string): Promise<Asistencia[]> {
    return await this.asistenciasRepository.find({
      where: {
        clase: { id: claseId },
        fecha: new Date(fecha)
      },
      relations: ['beneficiario', 'clase'],
      order: { beneficiario: { nombre: 'ASC' } }
    });
  }

  // Obtener reporte de asistencia por clase
  async getReportePorClase(claseId: string, fechaInicio?: string, fechaFin?: string): Promise<any> {
    const clase = await this.clasesRepository.findOne({
      where: { id: claseId },
      relations: ['tutor', 'horario', 'beneficiarios']
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${claseId} no encontrada`);
    }

    const query = this.asistenciasRepository.createQueryBuilder('asistencia')
      .leftJoinAndSelect('asistencia.beneficiario', 'beneficiario')
      .where('asistencia.clase.id = :claseId', { claseId });

    if (fechaInicio && fechaFin) {
      query.andWhere('asistencia.fecha BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio,
        fechaFin
      });
    }

    const asistencias = await query.getMany();

    const totalRegistros = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === EstadoAsistencia.PRESENTE).length;
    const ausentes = asistencias.filter(a => a.estado === EstadoAsistencia.AUSENTE).length;
    const justificados = asistencias.filter(a => a.estado === EstadoAsistencia.JUSTIFICADO).length;
    const tardes = asistencias.filter(a => a.estado === EstadoAsistencia.TARDE).length;

    const porcentajeAsistencia = totalRegistros > 0
      ? (((presentes + tardes) / totalRegistros) * 100).toFixed(2)
      : '0';

    return {
      clase: {
        id: clase.id,
        nombre: clase.nombre,
        codigo: clase.codigo,
        tutor: `${clase.tutor.nombre} ${clase.tutor.apellido || ''}`.trim(),
        horario: `${clase.horario.dia} ${clase.horario.hora_inicio} - ${clase.horario.hora_fin}`
      },
      periodo: {
        fechaInicio: fechaInicio || 'Desde el inicio',
        fechaFin: fechaFin || 'Hasta la fecha'
      },
      estadisticas: {
        totalRegistros,
        presentes,
        ausentes,
        justificados,
        tardes,
        porcentajeAsistencia: `${porcentajeAsistencia}%`
      },
      asistenciasPorBeneficiario: this.agruparPorBeneficiario(asistencias)
    };
  }

  // Obtener reporte de asistencia por beneficiario
  async getReportePorBeneficiario(beneficiarioId: string, fechaInicio?: string, fechaFin?: string): Promise<any> {
    const beneficiario = await this.beneficiariosRepository.findOne({
      where: { id: beneficiarioId },
      relations: ['clases']
    });

    if (!beneficiario) {
      throw new NotFoundException(`Beneficiario con ID ${beneficiarioId} no encontrado`);
    }

    const query = this.asistenciasRepository.createQueryBuilder('asistencia')
      .leftJoinAndSelect('asistencia.clase', 'clase')
      .leftJoinAndSelect('clase.tutor', 'tutor')
      .where('asistencia.beneficiario.id = :beneficiarioId', { beneficiarioId });

    if (fechaInicio && fechaFin) {
      query.andWhere('asistencia.fecha BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio,
        fechaFin
      });
    }

    const asistencias = await query.getMany();

    const totalRegistros = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === EstadoAsistencia.PRESENTE).length;
    const ausentes = asistencias.filter(a => a.estado === EstadoAsistencia.AUSENTE).length;
    const justificados = asistencias.filter(a => a.estado === EstadoAsistencia.JUSTIFICADO).length;
    const tardes = asistencias.filter(a => a.estado === EstadoAsistencia.TARDE).length;

    const porcentajeAsistencia = totalRegistros > 0
      ? (((presentes + tardes) / totalRegistros) * 100).toFixed(2)
      : '0';

    return {
      beneficiario: {
        id: beneficiario.id,
        codigo: beneficiario.codigo,
        nombre: `${beneficiario.nombre} ${beneficiario.apellido || ''}`.trim(),
        edad: beneficiario.fecha_nacimiento
          ? (() => {
              const nac = new Date(beneficiario.fecha_nacimiento);
              const hoy = new Date();
              let edad = hoy.getFullYear() - nac.getFullYear();
              if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
              return edad;
            })()
          : null,
        padre_tutor: beneficiario.padre_tutor
      },
      periodo: {
        fechaInicio: fechaInicio || 'Desde el inicio',
        fechaFin: fechaFin || 'Hasta la fecha'
      },
      estadisticas: {
        totalClasesInscritas: beneficiario.clases.length,
        totalRegistros,
        presentes,
        ausentes,
        justificados,
        tardes,
        porcentajeAsistencia: `${porcentajeAsistencia}%`
      },
      asistenciasPorClase: this.agruparPorClase(asistencias)
    };
  }

  // Método auxiliar para agrupar por beneficiario
  private agruparPorBeneficiario(asistencias: Asistencia[]): any[] {
    const agrupado = asistencias.reduce((acc, asistencia) => {
      const key = asistencia.beneficiario.id;
      if (!acc[key]) {
        acc[key] = {
          beneficiario: {
            id: asistencia.beneficiario.id,
            codigo: asistencia.beneficiario.codigo,
            nombre: `${asistencia.beneficiario.nombre} ${asistencia.beneficiario.apellido || ''}`.trim()
          },
          registros: []
        };
      }
      acc[key].registros.push({
        fecha: asistencia.fecha,
        estado: asistencia.estado,
        observaciones: asistencia.observaciones
      });
      return acc;
    }, {});

    return Object.values(agrupado);
  }

  // Método auxiliar para agrupar por clase
  private agruparPorClase(asistencias: Asistencia[]): any[] {
    const agrupado = asistencias.reduce((acc, asistencia) => {
      const key = asistencia.clase.id;
      if (!acc[key]) {
        acc[key] = {
          clase: {
            id: asistencia.clase.id,
            nombre: asistencia.clase.nombre,
            codigo: asistencia.clase.codigo
          },
          registros: []
        };
      }
      acc[key].registros.push({
        fecha: asistencia.fecha,
        estado: asistencia.estado,
        observaciones: asistencia.observaciones
      });
      return acc;
    }, {});

    return Object.values(agrupado);
  }

  // Obtener estadísticas mensuales
  async getEstadisticasMensuales(mes: number, anio: number): Promise<any> {
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0);

    const asistencias = await this.asistenciasRepository.find({
      where: {
        fecha: Between(fechaInicio, fechaFin)
      },
      relations: ['clase', 'beneficiario']
    });

    const totalRegistros = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === EstadoAsistencia.PRESENTE).length;
    const ausentes = asistencias.filter(a => a.estado === EstadoAsistencia.AUSENTE).length;
    const justificados = asistencias.filter(a => a.estado === EstadoAsistencia.JUSTIFICADO).length;
    const tardes = asistencias.filter(a => a.estado === EstadoAsistencia.TARDE).length;

    return {
      periodo: {
        mes,
        anio,
        fechaInicio,
        fechaFin
      },
      estadisticas: {
        totalRegistros,
        presentes,
        ausentes,
        justificados,
        tardes,
        porcentajeAsistencia: totalRegistros > 0
          ? `${(((presentes + tardes) / totalRegistros) * 100).toFixed(2)}%`
          : '0%'
      }
    };
  }
}