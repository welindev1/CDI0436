import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { NutricionService } from './nutricion.service';
import { CreateMenuNutricionDto } from './dto/create-menu.dto';
import { UpdateMenuNutricionDto } from './dto/update-menu.dto';
import { TandaNutricion } from './menu-nutricion.entity';

@Controller('nutricion/menus')
export class NutricionController {
  constructor(private readonly nutricionService: NutricionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMenuNutricionDto) {
    return this.nutricionService.create(dto);
  }

  // GET /nutricion/menus?anio=2025&mes=4
  @Get()
  findByMes(
    @Query('anio', ParseIntPipe) anio: number,
    @Query('mes', ParseIntPipe) mes: number,
  ) {
    return this.nutricionService.findByMes(anio, mes);
  }

  // GET /nutricion/menus/fecha/:fecha/:tanda
  @Get('fecha/:fecha/:tanda')
  findByFechaYTanda(
    @Param('fecha') fecha: string,
    @Param('tanda') tanda: TandaNutricion,
  ) {
    return this.nutricionService.findByFechaYTanda(fecha, tanda);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuNutricionDto,
  ) {
    return this.nutricionService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutricionService.remove(id);
  }
}
