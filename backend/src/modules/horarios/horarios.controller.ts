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
  UseGuards,
} from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { FilterHorarioDto } from './dto/filter-horario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';

@Controller('horarios')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  @RequierePermiso('horarios:crear')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horariosService.create(createHorarioDto);
  }

  @Get()
  @RequierePermiso('horarios:ver')
  findAll(@Query() filters: FilterHorarioDto) {
    return this.horariosService.findAll(filters);
  }

  @Get('disponibles')
  @RequierePermiso('horarios:ver')
  findDisponibles() {
    return this.horariosService.findDisponibles();
  }

  @Get('dia/:dia')
  @RequierePermiso('horarios:ver')
  findByDia(@Param('dia') dia: string) {
    return this.horariosService.findByDia(dia);
  }

  @Get(':id')
  @RequierePermiso('horarios:ver')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.horariosService.findOne(id);
  }

  @Patch(':id')
  @RequierePermiso('horarios:editar')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHorarioDto: UpdateHorarioDto,
  ) {
    return this.horariosService.update(id, updateHorarioDto);
  }

  @Delete(':id')
  @RequierePermiso('horarios:eliminar')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.horariosService.remove(id);
  }

  @Patch(':id/desactivar')
  @RequierePermiso('horarios:editar')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.horariosService.softDelete(id);
  }
}
