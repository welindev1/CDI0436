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
  HttpStatus
} from '@nestjs/common';
import { SupervivenciasService } from './supervivencias.service';
import { CreateSupervivenciaDto } from './dto/create-supervivencia.dto';
import { UpdateSupervivenciaDto } from './dto/update-supervivencia.dto';
import { FilterSupervivenciaDto } from './dto/filter-supervivencia.dto';
import { AgregarBeneficiariosSupervivenciaDto } from './dto/agregar-beneficiarios.dto';
import { RegistrarAsistenciaSupervivenciaDto } from './dto/registrar-asistencia.dto';

@Controller('supervivencias')
export class SupervivenciasController {
  constructor(private readonly supervivenciasService: SupervivenciasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSupervivenciaDto: CreateSupervivenciaDto) {
    return this.supervivenciasService.create(createSupervivenciaDto);
  }

  @Get()
  findAll(@Query() filters: FilterSupervivenciaDto) {
    return this.supervivenciasService.findAll(filters);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.supervivenciasService.findByCodigo(codigo);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.supervivenciasService.findOne(id);
  }

  @Get(':id/estadisticas')
  getEstadisticas(@Param('id', ParseUUIDPipe) id: string) {
    return this.supervivenciasService.getEstadisticas(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupervivenciaDto: UpdateSupervivenciaDto
  ) {
    return this.supervivenciasService.update(id, updateSupervivenciaDto);
  }

  @Post(':id/beneficiarios')
  agregarBeneficiarios(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() agregarBeneficiariosDto: AgregarBeneficiariosSupervivenciaDto
  ) {
    return this.supervivenciasService.agregarBeneficiarios(id, agregarBeneficiariosDto);
  }

  @Delete(':id/beneficiarios/:beneficiarioId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerBeneficiario(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('beneficiarioId', ParseUUIDPipe) beneficiarioId: string
  ) {
    return this.supervivenciasService.removerBeneficiario(id, beneficiarioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.supervivenciasService.remove(id);
  }

  @Patch(':id/desactivar')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.supervivenciasService.softDelete(id);
  }

  // Endpoints de asistencia
  @Post(':id/asistencias')
  @HttpCode(HttpStatus.CREATED)
  registrarAsistencia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() registrarAsistenciaDto: RegistrarAsistenciaSupervivenciaDto
  ) {
    return this.supervivenciasService.registrarAsistencia(id, registrarAsistenciaDto);
  }

  @Get(':id/asistencias')
  getAsistenciasPorFecha(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fecha') fecha: string
  ) {
    return this.supervivenciasService.getAsistenciasPorFecha(id, fecha);
  }

  @Get(':id/asistencias/historial')
  getHistorialAsistencias(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string
  ) {
    return this.supervivenciasService.getHistorialAsistencias(id, fechaInicio, fechaFin);
  }

  @Get(':id/asistencias/fechas')
  getFechasConAsistencia(@Param('id', ParseUUIDPipe) id: string) {
    return this.supervivenciasService.getFechasConAsistencia(id);
  }
}
