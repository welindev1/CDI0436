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

import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { FilterAsistenciaDto } from './dto/filter-asistencia.dto';
import { RegistrarAsistenciaMasivaDto } from './dto/registrar-asistencia-masiva.dto';
import { MarcarTodosDto } from './dto/marcar-todos.dto';
import { JustificarMasivoDto } from './dto/justificar-masivo.dto';

@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAsistenciaDto: CreateAsistenciaDto) {
    return this.asistenciasService.create(createAsistenciaDto);
  }

  @Post('masiva')
  @HttpCode(HttpStatus.CREATED)
  registrarAsistenciaMasiva(@Body() dto: RegistrarAsistenciaMasivaDto) {
    return this.asistenciasService.registrarAsistenciaMasiva(dto);
  }

  @Post('marcar-todos')
  @HttpCode(HttpStatus.CREATED)
  marcarTodos(@Body() dto: MarcarTodosDto) {
    return this.asistenciasService.marcarTodos(dto);
  }

  @Post('justificar-masivo')
  justificarMasivo(@Body() dto: JustificarMasivoDto) {
    return this.asistenciasService.justificarMasivo(dto);
  }

  @Get()
  findAll(@Query() filters: FilterAsistenciaDto) {
    return this.asistenciasService.findAll(filters);
  }

  @Get('clase/:claseId/fecha/:fecha')
  findByClaseYFecha(
    @Param('claseId', ParseUUIDPipe) claseId: string,
    @Param('fecha') fecha: string,
  ) {
    return this.asistenciasService.findByClaseYFecha(claseId, fecha);
  }

  @Get('reporte/clase/:claseId')
  getReportePorClase(
    @Param('claseId', ParseUUIDPipe) claseId: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.asistenciasService.getReportePorClase(claseId, fechaInicio, fechaFin);
  }

  @Get('reporte/beneficiario/:beneficiarioId')
  getReportePorBeneficiario(
    @Param('beneficiarioId', ParseUUIDPipe) beneficiarioId: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.asistenciasService.getReportePorBeneficiario(
      beneficiarioId,
      fechaInicio,
      fechaFin,
    );
  }

  @Get('estadisticas/mensuales/:mes/:anio')
  getEstadisticasMensuales(
    @Param('mes', ParseIntPipe) mes: number,
    @Param('anio', ParseIntPipe) anio: number,
  ) {
    return this.asistenciasService.getEstadisticasMensuales(mes, anio);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.asistenciasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ) {
    return this.asistenciasService.update(id, updateAsistenciaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.asistenciasService.remove(id);
  }
}
