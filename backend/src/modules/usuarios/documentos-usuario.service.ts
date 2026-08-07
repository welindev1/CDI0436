import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import {
  DocumentoUsuario,
  TipoDocumentoUsuario,
} from './documento-usuario.entity';
import { FilterDocumentoUsuarioDto } from './dto/filter-documento-usuario.dto';

const MIME_TYPES_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

function decodeFileName(name: string): string {
  try {
    return Buffer.from(name, 'latin1').toString('utf8');
  } catch {
    return name;
  }
}

@Injectable()
export class DocumentosUsuarioService {
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(DocumentoUsuario)
    private readonly documentoRepo: Repository<DocumentoUsuario>,
  ) {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'documentos-usuarios');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async subirDocumento(
    usuarioId: string,
    file: Express.Multer.File,
    tipo_documento: TipoDocumentoUsuario,
    año: number,
    notas?: string,
    subidoPorId?: string,
  ): Promise<DocumentoUsuario> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!MIME_TYPES_PERMITIDOS.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan PDF, JPEG y PNG',
      );
    }

    const timestamp = Date.now();
    const originalName = decodeFileName(file.originalname);
    const nombreArchivo = `${año}_${timestamp}_${originalName}`;
    const dirUsuario = path.join(this.uploadDir, usuarioId, tipo_documento);

    if (!fs.existsSync(dirUsuario)) {
      fs.mkdirSync(dirUsuario, { recursive: true });
    }

    const archivoPath = path.join(dirUsuario, nombreArchivo);
    fs.writeFileSync(archivoPath, file.buffer);

    const documento = this.documentoRepo.create({
      usuario: { id: usuarioId } as any,
      tipo_documento,
      año,
      archivo_url: `/uploads/documentos-usuarios/${usuarioId}/${tipo_documento}/${nombreArchivo}`,
      nombre_original: originalName,
      notas: notas || undefined,
      subido_por: subidoPorId ? ({ id: subidoPorId } as any) : undefined,
    });

    return this.documentoRepo.save(documento);
  }

  async findAll(
    usuarioId: string,
    filters?: FilterDocumentoUsuarioDto,
  ): Promise<DocumentoUsuario[]> {
    const where: any = { usuario: { id: usuarioId } };

    if (filters?.tipo_documento) {
      where.tipo_documento = filters.tipo_documento;
    }

    if (filters?.año) {
      where.año = filters.año;
    }

    return this.documentoRepo.find({
      where,
      relations: ['subido_por'],
      order: {
        tipo_documento: 'ASC',
        año: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<DocumentoUsuario> {
    const documento = await this.documentoRepo.findOne({
      where: { id },
      relations: ['subido_por', 'usuario'],
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    return documento;
  }

  async remove(id: string): Promise<void> {
    const documento = await this.findOne(id);

    const filePath = path.join(process.cwd(), documento.archivo_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.documentoRepo.remove(documento);
  }

  getTipos(): { value: TipoDocumentoUsuario; label: string }[] {
    return Object.values(TipoDocumentoUsuario).map((tipo) => {
      const labels: Record<TipoDocumentoUsuario, string> = {
        [TipoDocumentoUsuario.FIRMA]: 'Firma del Compromiso',
        [TipoDocumentoUsuario.ANTECEDENTES_PENALES]: 'Antecedentes Penales',
        [TipoDocumentoUsuario.EXAMEN_PROTECCION]: 'Examen Protección',
        [TipoDocumentoUsuario.VACACIONES]: 'Vacaciones',
        [TipoDocumentoUsuario.LICENCIAS]: 'Licencias',
        [TipoDocumentoUsuario.SUSPENSION]: 'Suspensión',
        [TipoDocumentoUsuario.AMONESTACION]: 'Amonestación',
        [TipoDocumentoUsuario.OTRO]: 'Otro',
      };
      return { value: tipo, label: labels[tipo] };
    });
  }
}
