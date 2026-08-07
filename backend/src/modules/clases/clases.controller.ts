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
import { ClasesService } from './clases.service';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { FilterClaseDto } from './dto/filter-clase.dto';
import { AgregarBeneficiariosDto } from './dto/agregar-beneficiarios.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';

@Controller('clases')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  @Post()
  @RequierePermiso('clases:crear')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClaseDto: CreateClaseDto) {
    return this.clasesService.create(createClaseDto);
  }

  @Get()
  @RequierePermiso('clases:ver')
  findAll(@Query() filters: FilterClaseDto) {
    return this.clasesService.findAll(filters);
  }

  @Get('tutor/:tutorId')
  @RequierePermiso('clases:ver')
  findByTutor(@Param('tutorId', ParseUUIDPipe) tutorId: string) {
    return this.clasesService.findByTutor(tutorId);
  }

  @Get('codigo/:codigo')
  @RequierePermiso('clases:ver')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.clasesService.findByCodigo(codigo);
  }

  @Get(':id')
  @RequierePermiso('clases:ver')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clasesService.findOne(id);
  }

  @Get(':id/estadisticas')
  @RequierePermiso('clases:ver')
  getEstadisticas(@Param('id', ParseUUIDPipe) id: string) {
    return this.clasesService.getEstadisticas(id);
  }

  @Patch(':id')
  @RequierePermiso('clases:editar')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClaseDto: UpdateClaseDto,
  ) {
    return this.clasesService.update(id, updateClaseDto);
  }

  @Post(':id/beneficiarios')
  @RequierePermiso('clases:editar')
  agregarBeneficiarios(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() agregarBeneficiariosDto: AgregarBeneficiariosDto,
  ) {
    return this.clasesService.agregarBeneficiarios(id, agregarBeneficiariosDto);
  }

  @Delete(':id/beneficiarios/:beneficiarioId')
  @RequierePermiso('clases:editar')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerBeneficiario(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('beneficiarioId', ParseUUIDPipe) beneficiarioId: string,
  ) {
    return this.clasesService.removerBeneficiario(id, beneficiarioId);
  }

  @Delete(':id')
  @RequierePermiso('clases:eliminar')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clasesService.remove(id);
  }

  @Patch(':id/desactivar')
  @RequierePermiso('clases:editar')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.clasesService.softDelete(id);
  }
}
