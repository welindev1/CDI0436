import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial } from 'typeorm';
import { Beneficiario } from './beneficiario.entity';
import { CreateBeneficiarioDto } from './dto/create-beneficiario.dto';
import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';
import { FilterBeneficiarioDto } from './dto/filter-beneficiario.dto';
import { AsignarClaseDto } from './dto/asignar-clase.dto';
import { Clase } from '../clases/clase.entity';
import * as XLSX from 'xlsx';

interface ImportOptionsDto {
  actualizarExistentes?: boolean;
  omitirErrores?: boolean;
}

@Injectable()
export class BeneficiariosService {
  constructor(
    @InjectRepository(Beneficiario)
    private beneficiariosRepository: Repository<Beneficiario>,
    @InjectRepository(Clase)
    private clasesRepository: Repository<Clase>,
  ) {}

  async create(createBeneficiarioDto: CreateBeneficiarioDto): Promise<Beneficiario> {
    const existe = await this.beneficiariosRepository.findOne({
      where: { codigo: createBeneficiarioDto.codigo },
    });

    if (existe) {
      throw new ConflictException(`Ya existe un beneficiario con el código ${createBeneficiarioDto.codigo}`);
    }

    const beneficiario = this.beneficiariosRepository.create(createBeneficiarioDto);
    return await this.beneficiariosRepository.save(beneficiario);
  }

  async findAll(filters?: FilterBeneficiarioDto): Promise<Beneficiario[]> {
    const query = this.beneficiariosRepository.createQueryBuilder('beneficiario')
      .leftJoinAndSelect('beneficiario.clases', 'clases')
      .leftJoinAndSelect('clases.tutor', 'tutor')
      .leftJoinAndSelect('clases.horario', 'horario')
      .orderBy('beneficiario.nombre', 'ASC');

    if (filters) {
      if (filters.nombre) {
        query.andWhere(
          '(beneficiario.nombre ILIKE :nombre OR beneficiario.apellido ILIKE :nombre)',
          { nombre: `%${filters.nombre}%` }
        );
      }

      if (filters.codigo) {
        query.andWhere('beneficiario.codigo ILIKE :codigo', { codigo: `%${filters.codigo}%` });
      }

      if (filters.correo) {
        query.andWhere('beneficiario.correo ILIKE :correo', { correo: `%${filters.correo}%` });
      }

      if (filters.padre_tutor) {
        query.andWhere('beneficiario.padre_tutor ILIKE :padre_tutor', { 
          padre_tutor: `%${filters.padre_tutor}%` 
        });
      }

      if (filters.activo !== undefined) {
        query.andWhere('beneficiario.activo = :activo', { activo: filters.activo });
      }

      if (filters.edadMin !== undefined) {
        query.andWhere('beneficiario.edad >= :edadMin', { edadMin: filters.edadMin });
      }

      if (filters.edadMax !== undefined) {
        query.andWhere('beneficiario.edad <= :edadMax', { edadMax: filters.edadMax });
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Beneficiario> {
    const beneficiario = await this.beneficiariosRepository.findOne({
      where: { id },
      relations: ['clases', 'clases.tutor', 'clases.horario', 'asistencias']
    });

    if (!beneficiario) {
      throw new NotFoundException(`Beneficiario con ID ${id} no encontrado`);
    }

    return beneficiario;
  }

  async findByCodigo(codigo: string): Promise<Beneficiario> {
    const beneficiario = await this.beneficiariosRepository.findOne({
      where: { codigo },
      relations: ['clases', 'clases.tutor', 'clases.horario']
    });

    if (!beneficiario) {
      throw new NotFoundException(`Beneficiario con código ${codigo} no encontrado`);
    }

    return beneficiario;
  }

  async update(id: string, updateBeneficiarioDto: UpdateBeneficiarioDto): Promise<Beneficiario> {
    const beneficiario = await this.findOne(id);

    if (updateBeneficiarioDto.codigo && updateBeneficiarioDto.codigo !== beneficiario.codigo) {
      const existe = await this.beneficiariosRepository.findOne({
        where: { codigo: updateBeneficiarioDto.codigo }
      });

      if (existe) {
        throw new ConflictException(`Ya existe un beneficiario con el código ${updateBeneficiarioDto.codigo}`);
      }
    }

    Object.assign(beneficiario, updateBeneficiarioDto);
    return await this.beneficiariosRepository.save(beneficiario);
  }

  async remove(id: string): Promise<void> {
    const beneficiario = await this.beneficiariosRepository.findOne({
      where: { id },
      relations: ['clases', 'asistencias']
    });

    if (!beneficiario) {
      throw new NotFoundException(`Beneficiario con ID ${id} no encontrado`);
    }

    if (beneficiario.clases && beneficiario.clases.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el beneficiario porque está inscrito en ${beneficiario.clases.length} clase(s)`
      );
    }

    await this.beneficiariosRepository.remove(beneficiario);
  }

  async softDelete(id: string): Promise<Beneficiario> {
    const beneficiario = await this.findOne(id);
    beneficiario.activo = false;
    return await this.beneficiariosRepository.save(beneficiario);
  }

  async asignarClases(id: string, asignarClaseDto: AsignarClaseDto): Promise<Beneficiario> {
    const beneficiario = await this.findOne(id);

    const clases = await this.clasesRepository.find({
        where: { id: In(asignarClaseDto.claseIds) }
    });

    if (clases.length !== asignarClaseDto.claseIds.length) {
        throw new NotFoundException('Una o más clases no fueron encontradas');
    }

    for (const clase of clases) {
        const claseCompleta = await this.clasesRepository.findOne({
        where: { id: clase.id },
        relations: ['beneficiarios']
        });

        if (!claseCompleta) {
        throw new NotFoundException(`Clase con ID ${clase.id} no encontrada`);
        }

        const capacidad = claseCompleta.capacidad_maxima ?? 0;
        const inscritos = claseCompleta.beneficiarios?.length ?? 0;

        if (capacidad > 0 && inscritos >= capacidad) {
        throw new BadRequestException(`La clase ${claseCompleta.nombre} ha alcanzado su capacidad máxima`);
        }
    }

    const clasesExistentes = beneficiario.clases || [];
    const nuevasClases = clases.filter(
        clase => !clasesExistentes.some(c => c.id === clase.id)
    );

    beneficiario.clases = [...clasesExistentes, ...nuevasClases];
    return await this.beneficiariosRepository.save(beneficiario);
  }

  async removerDeClase(id: string, claseId: string): Promise<Beneficiario> {
    const beneficiario = await this.findOne(id);

    beneficiario.clases = beneficiario.clases.filter(clase => clase.id !== claseId);
    return await this.beneficiariosRepository.save(beneficiario);
  }

  async findByClase(claseId: string): Promise<Beneficiario[]> {
    return await this.beneficiariosRepository.createQueryBuilder('beneficiario')
      .leftJoin('beneficiario.clases', 'clase')
      .where('clase.id = :claseId', { claseId })
      .andWhere('beneficiario.activo = :activo', { activo: true })
      .orderBy('beneficiario.nombre', 'ASC')
      .getMany();
  }

  async getEstadisticas(id: string): Promise<any> {
    const beneficiario = await this.beneficiariosRepository.findOne({
      where: { id },
      relations: ['clases', 'asistencias']
    });

    if (!beneficiario) {
      throw new NotFoundException(`Beneficiario con ID ${id} no encontrado`);
    }

    const totalClases = beneficiario.clases?.length || 0;
    const totalAsistencias = beneficiario.asistencias?.length || 0;
    const presentes = beneficiario.asistencias?.filter(a => a.estado === 'presente').length || 0;
    const ausentes = beneficiario.asistencias?.filter(a => a.estado === 'ausente').length || 0;
    const justificados = beneficiario.asistencias?.filter(a => a.estado === 'justificado').length || 0;
    const tardes = beneficiario.asistencias?.filter(a => a.estado === 'tarde').length || 0;

    const porcentajeAsistencia = totalAsistencias > 0 
      ? ((presentes + tardes) / totalAsistencias * 100).toFixed(2)
      : 0;

    return {
      beneficiario: {
        id: beneficiario.id,
        codigo: beneficiario.codigo,
        nombre: `${beneficiario.nombre} ${beneficiario.apellido || ''}`.trim(),
      }, 
      estadisticas: {
        totalClasesInscritas: totalClases,
        totalAsistenciasRegistradas: totalAsistencias,
        presentes,
        ausentes,
        justificados,
        tardes,
        porcentajeAsistencia: `${porcentajeAsistencia}%`
      },
    };
  }

  async importarDesdeExcel(
  buffer: Buffer,
  options?: ImportOptionsDto
): Promise<{
  exitosos: number;
  fallidos: number;
  errores: Array<{ fila: number; error: string; datos: any }>;
  beneficiarios: Beneficiario[];
}> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(worksheet, {
    raw: false,
    defval: null
  });

  const resultados = {
    exitosos: 0,
    fallidos: 0,
    errores: [] as Array<{ fila: number; error: string; datos: any }>,
    beneficiarios: [] as Beneficiario[]
  };

  for (let i = 0; i < data.length; i++) {
    const fila = data[i] as any;
    const numeroFila = i + 2;

    try {
      if (!fila.CODIGO || !fila.NOMBRE) {
        throw new Error('Faltan campos requeridos: CODIGO y NOMBRE');
      }

      const beneficiarioData: Partial<Beneficiario> = {
        codigo: String(fila.CODIGO).trim(),
        nombre: String(fila.NOMBRE).trim(),
        apellido: fila.APELLIDO ? String(fila.APELLIDO).trim() : undefined,
        direccion: fila.DIRECCION ? String(fila.DIRECCION).trim() : undefined,
        telefono: fila.TELEFONO ? String(fila.TELEFONO).trim() : undefined,
        padre_tutor:
          fila['PADRE O TUTOR'] || fila.PADRE_TUTOR
            ? String(fila['PADRE O TUTOR'] || fila.PADRE_TUTOR).trim()
            : undefined,
        edad: fila.EDAD ? parseInt(String(fila.EDAD)) : undefined,
        correo: fila.CORREO ? String(fila.CORREO).trim() : undefined,
        activo: true
      };

      if (
        beneficiarioData.edad &&
        (beneficiarioData.edad < 0 || beneficiarioData.edad > 120)
      ) {
        throw new Error('Edad inválida');
      }

      const existente = await this.beneficiariosRepository.findOne({
        where: { codigo: beneficiarioData.codigo }
      });

      let nuevoBeneficiario: Beneficiario;

      if (existente) {
        if (options?.actualizarExistentes) {
          Object.assign(existente, beneficiarioData);
          nuevoBeneficiario = await this.beneficiariosRepository.save(existente);
          resultados.exitosos++;
        } else {
          throw new Error(`El código ${beneficiarioData.codigo} ya existe`);
        }
      } else {
        const entidad = this.beneficiariosRepository.create(
          beneficiarioData as DeepPartial<Beneficiario>
        );

        const guardado = await this.beneficiariosRepository.save(entidad);
        nuevoBeneficiario = Array.isArray(guardado) ? guardado[0] : guardado;
        resultados.exitosos++;
      }

      resultados.beneficiarios.push(nuevoBeneficiario);
    } catch (error: any) {
      resultados.fallidos++;
      resultados.errores.push({
        fila: numeroFila,
        error: error?.message || String(error),
        datos: fila
      });

      if (!options?.omitirErrores) {
        throw new BadRequestException({
          message: 'Error al importar beneficiarios',
          detalles: resultados
        });
      }
    }
  }

  return resultados;
}

  async generarPlantillaExcel(): Promise<Buffer> {
    const plantilla = [
      {
        CODIGO: 'BEN001',
        NOMBRE: 'Juan',
        APELLIDO: 'Pérez',
        DIRECCION: 'Calle Principal #123',
        TELEFONO: '809-555-1234',
        'PADRE O TUTOR': 'María Pérez',
        EDAD: 15,
        CORREO: 'juan.perez@example.com'
      },
      {
        CODIGO: 'BEN002',
        NOMBRE: 'Ana',
        APELLIDO: 'González',
        DIRECCION: 'Av. Independencia #456',
        TELEFONO: '809-555-5678',
        'PADRE O TUTOR': 'Pedro González',
        EDAD: 14,
        CORREO: 'ana.gonzalez@example.com'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(plantilla);
    
    const columnWidths = [
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 8 },
      { wch: 25 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Beneficiarios');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportarAExcel(filters?: FilterBeneficiarioDto): Promise<Buffer> {
    const beneficiarios = await this.findAll(filters);

    const data = beneficiarios.map(b => ({
      CODIGO: b.codigo,
      NOMBRE: b.nombre,
      APELLIDO: b.apellido || '',
      DIRECCION: b.direccion || '',
      TELEFONO: b.telefono || '',
      'PADRE O TUTOR': b.padre_tutor || '',
      EDAD: b.edad || '',
      CORREO: b.correo || '',
      ESTADO: b.activo ? 'Activo' : 'Inactivo',
      'FECHA REGISTRO': new Date(b.creado_en).toLocaleDateString('es-DO')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const columnWidths = [
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 8 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Beneficiarios');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
