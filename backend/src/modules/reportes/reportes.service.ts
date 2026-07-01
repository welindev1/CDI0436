import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reporte } from './reporte.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Reporte)
    private reportesRepository: Repository<Reporte>,
  ) {}

  async create(data: Partial<Reporte>): Promise<Reporte> {
    const reporte = this.reportesRepository.create(data);
    return await this.reportesRepository.save(reporte);
  }

  async findAll(): Promise<Reporte[]> {
    return await this.reportesRepository.find({
      order: { creado_en: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Reporte> {
    const reporte = await this.reportesRepository.findOne({
      where: { id },
    });

    if (!reporte) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }

    return reporte;
  }

  async remove(id: string): Promise<void> {
    const reporte = await this.findOne(id);
    await this.reportesRepository.remove(reporte);
  }
}
