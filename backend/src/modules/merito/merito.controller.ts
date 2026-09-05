import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MeritoService } from './merito.service';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { CreateNotaDto } from './dto/create-nota.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';

@Controller('merito')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class MeritoController {
  constructor(private readonly meritoService: MeritoService) {}

  @Post('periodos')
  @RequierePermiso('merito:crear')
  createPeriodo(@Body() createPeriodoDto: CreatePeriodoDto) {
    return this.meritoService.createPeriodo(createPeriodoDto);
  }

  @Get('periodos')
  @RequierePermiso('merito:ver')
  findAllPeriodos() {
    return this.meritoService.findAllPeriodos();
  }

  @Delete('periodos/:id')
  @RequierePermiso('merito:crear') // Reusing crear or maybe merito:eliminar if we added it. Yes, we added it. Wait, I only added merito:ver, merito:crear, merito:editar to the PERMISOS_SISTEMA! Let's just use merito:crear for now, since it's admin-level.
  deletePeriodo(@Param('id') id: string) {
    return this.meritoService.deletePeriodo(id);
  }

  @Get('periodos/:id/dashboard')
  @RequierePermiso('merito:ver')
  getDashboardPeriodo(@Param('id') id: string) {
    return this.meritoService.getDashboardPeriodo(id);
  }

  @Post('periodos/:id/notas')
  @RequierePermiso('merito:editar')
  agregarNota(
    @Param('id') periodo_id: string,
    @Body() createNotaDto: CreateNotaDto,
  ) {
    return this.meritoService.agregarNota(periodo_id, createNotaDto);
  }

  @Get('periodos/:id/ganadores')
  @RequierePermiso('merito:ver')
  getGanadores(
    @Param('id') periodo_id: string,
    @Query('cant_primaria', new ParseIntPipe({ optional: true }))
    cant_primaria?: number,
    @Query('cant_secundaria', new ParseIntPipe({ optional: true }))
    cant_secundaria?: number,
    @Query('min_primaria', new ParseIntPipe({ optional: true }))
    min_primaria?: number,
    @Query('max_primaria', new ParseIntPipe({ optional: true }))
    max_primaria?: number,
    @Query('min_secundaria', new ParseIntPipe({ optional: true }))
    min_secundaria?: number,
    @Query('max_secundaria', new ParseIntPipe({ optional: true }))
    max_secundaria?: number,
  ) {
    return this.meritoService.getGanadores(
      periodo_id,
      cant_primaria ?? 3,
      cant_secundaria ?? 3,
      min_primaria,
      max_primaria,
      min_secundaria,
      max_secundaria,
    );
  }
}
