import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ayuda, EstadoAyuda } from './ayuda.entity';
import { CreateAyudaDto } from './dto/create-ayuda.dto';
import { UpdateEstadoAyudaDto } from './dto/update-estado-ayuda.dto';
import { WhatsappService } from './whatsapp.service';
import * as XLSX from 'xlsx';

@Injectable()
export class AyudasService {
  constructor(
    @InjectRepository(Ayuda)
    private ayudasRepository: Repository<Ayuda>,
    private whatsappService: WhatsappService,
  ) {}

  async create(createAyudaDto: CreateAyudaDto): Promise<Ayuda> {
    const ayuda = this.ayudasRepository.create(createAyudaDto);
    return await this.ayudasRepository.save(ayuda);
  }

  async findAll(): Promise<Ayuda[]> {
    return await this.ayudasRepository.find({
      order: { creado_en: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Ayuda> {
    const ayuda = await this.ayudasRepository.findOne({ where: { id } });
    if (!ayuda) {
      throw new NotFoundException(`Ayuda con ID ${id} no encontrada`);
    }
    return ayuda;
  }

  async updateEstado(id: string, updateEstadoDto: UpdateEstadoAyudaDto): Promise<Ayuda> {
    const ayuda = await this.findOne(id);
    ayuda.estado = updateEstadoDto.estado;
    const saved = await this.ayudasRepository.save(ayuda);

    // Enviar mensaje de WhatsApp automáticamente
    if (saved.telefono) {
      const estadoTexto = saved.estado === EstadoAyuda.APROBADA ? 'aprobada ✅' : 'rechazada ❌';
      const mensaje = `Hola ${saved.nombre_beneficiario}, le informamos que su solicitud de ayuda (${saved.tipo}) ha sido ${estadoTexto}. CDI - Centro de Desarrollo Integral.`;
      // Se envía de forma asíncrona sin bloquear la respuesta
      this.whatsappService.enviarMensaje(saved.telefono, mensaje);
    }

    return saved;
  }

  async remove(id: string): Promise<void> {
    const ayuda = await this.findOne(id);
    await this.ayudasRepository.remove(ayuda);
  }

  async exportarAExcel(): Promise<Buffer> {
    const ayudas = await this.findAll();

    const data = ayudas.map((a) => ({
      CODIGO: a.codigo_beneficiario,
      BENEFICIARIO: a.nombre_beneficiario,
      TELEFONO: a.telefono || '',
      MADRE: a.nombre_madre,
      TUTOR: a.nombre_tutor,
      TIPO: a.tipo.toUpperCase(),
      ESTADO: a.estado.toUpperCase(),
      DETALLE: a.detalle,
      'FECHA SOLICITUD': new Date(a.creado_en).toLocaleString('es-DO'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = [
      { wch: 15 }, // CODIGO
      { wch: 25 }, // BENEFICIARIO
      { wch: 15 }, // TELEFONO
      { wch: 25 }, // MADRE
      { wch: 25 }, // TUTOR
      { wch: 15 }, // TIPO
      { wch: 15 }, // ESTADO
      { wch: 40 }, // DETALLE
      { wch: 20 }, // FECHA
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes de Ayuda');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
