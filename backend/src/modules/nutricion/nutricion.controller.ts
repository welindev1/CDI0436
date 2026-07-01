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
  UseGuards,
} from '@nestjs/common';
import { NutricionService } from './nutricion.service';
import { CreateMenuNutricionDto } from './dto/create-menu.dto';
import { UpdateMenuNutricionDto } from './dto/update-menu.dto';
import { TandaNutricion } from './menu-nutricion.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';

@Controller('nutricion/menus')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class NutricionController {
  constructor(private readonly nutricionService: NutricionService) {}

  @Post()
  @RequierePermiso('nutricion:ver')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMenuNutricionDto) {
    return this.nutricionService.create(dto);
  }

  // GET /nutricion/menus?anio=2025&mes=4
  @Get()
  @RequierePermiso('nutricion:ver')
  findByMes(
    @Query('anio', ParseIntPipe) anio: number,
    @Query('mes', ParseIntPipe) mes: number,
  ) {
    return this.nutricionService.findByMes(anio, mes);
  }

  // GET /nutricion/menus/fecha/:fecha/:tanda
  @Get('fecha/:fecha/:tanda')
  @RequierePermiso('nutricion:ver')
  findByFechaYTanda(
    @Param('fecha') fecha: string,
    @Param('tanda') tanda: TandaNutricion,
  ) {
    return this.nutricionService.findByFechaYTanda(fecha, tanda);
  }

  @Patch(':id')
  @RequierePermiso('nutricion:ver')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuNutricionDto,
  ) {
    return this.nutricionService.update(id, dto);
  }

  @Delete(':id')
  @RequierePermiso('nutricion:ver')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutricionService.remove(id);
  }
}
