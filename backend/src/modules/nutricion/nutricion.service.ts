import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuNutricion, TandaNutricion } from './menu-nutricion.entity';
import { CreateMenuNutricionDto } from './dto/create-menu.dto';
import { UpdateMenuNutricionDto } from './dto/update-menu.dto';

@Injectable()
export class NutricionService {
  constructor(
    @InjectRepository(MenuNutricion)
    private menuRepository: Repository<MenuNutricion>,
  ) {}

  async create(dto: CreateMenuNutricionDto): Promise<MenuNutricion> {
    // Verificar si ya existe un menú para esa fecha y tanda
    const existente = await this.menuRepository.findOne({
      where: {
        fecha: new Date(`${dto.fecha}T12:00:00`),
        tanda: dto.tanda,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un menú para el ${dto.fecha} en la tanda ${dto.tanda}`,
      );
    }

    const menu = this.menuRepository.create({
      ...dto,
      fecha: new Date(`${dto.fecha}T12:00:00`),
    });

    return await this.menuRepository.save(menu);
  }

  async findByMes(anio: number, mes: number): Promise<MenuNutricion[]> {
    return await this.menuRepository
      .createQueryBuilder('menu')
      .where('EXTRACT(YEAR FROM menu.fecha) = :anio', { anio })
      .andWhere('EXTRACT(MONTH FROM menu.fecha) = :mes', { mes })
      .orderBy('menu.fecha', 'ASC')
      .addOrderBy('menu.tanda', 'ASC')
      .getMany();
  }

  async findByFechaYTanda(
    fecha: string,
    tanda: TandaNutricion,
  ): Promise<MenuNutricion | null> {
    return await this.menuRepository
      .createQueryBuilder('menu')
      .where('DATE(menu.fecha) = DATE(:fecha)', { fecha })
      .andWhere('menu.tanda = :tanda', { tanda })
      .getOne();
  }

  async update(
    id: string,
    dto: UpdateMenuNutricionDto,
  ): Promise<MenuNutricion> {
    const menu = await this.menuRepository.findOne({ where: { id } });

    if (!menu) {
      throw new NotFoundException(`Menú con ID ${id} no encontrado`);
    }

    Object.assign(menu, dto);
    return await this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.menuRepository.findOne({ where: { id } });

    if (!menu) {
      throw new NotFoundException(`Menú con ID ${id} no encontrado`);
    }

    await this.menuRepository.remove(menu);
  }
}
