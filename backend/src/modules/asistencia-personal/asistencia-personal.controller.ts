import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Res,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AsistenciaPersonalService } from './asistencia-personal.service';
import { ReportesAsistenciaService } from './reportes-asistencia.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import {
  CreateAsistenciaPersonalDto,
  MarcarSalidaDto,
} from './dto/create-asistencia-personal.dto';
import { FilterAsistenciaPersonalDto } from './dto/filter-asistencia-personal.dto';
import { TurnoPersonal } from './asistencia-personal.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('asistencia-personal')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class AsistenciaPersonalController {
  constructor(
    private readonly asistenciaService: AsistenciaPersonalService,
    private readonly reportesService: ReportesAsistenciaService,
  ) {}

  @Post('trabajadores')
  @RequierePermiso('usuarios:editar')
  @HttpCode(HttpStatus.CREATED)
  createTrabajador(@Body() dto: CreateTrabajadorDto) {
    return this.asistenciaService.createTrabajador(dto);
  }

  @Get('trabajadores')
  @RequierePermiso('usuarios:ver')
  findAllTrabajadores() {
    return this.asistenciaService.findAllTrabajadores();
  }

  @Patch('trabajadores/:id')
  @RequierePermiso('usuarios:editar')
  updateTrabajador(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTrabajadorDto,
  ) {
    return this.asistenciaService.updateTrabajador(id, dto);
  }

  @Delete('trabajadores/:id')
  @RequierePermiso('usuarios:editar')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTrabajador(@Param('id', ParseUUIDPipe) id: string) {
    return this.asistenciaService.removeTrabajador(id);
  }

  @Post('trabajadores/:id/entrada')
  @RequierePermiso('usuarios:editar')
  marcarEntrada(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAsistenciaPersonalDto,
    @CurrentUser() user: any,
  ) {
    return this.asistenciaService.marcarEntrada(id, dto, user.id);
  }

  @Patch('trabajadores/:id/salida')
  @RequierePermiso('usuarios:editar')
  marcarSalida(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('fecha') fecha: string,
    @Body() dto: MarcarSalidaDto,
  ) {
    return this.asistenciaService.marcarSalida(id, fecha, dto);
  }

  @Get()
  @RequierePermiso('usuarios:ver')
  findAll(@Query() filters: FilterAsistenciaPersonalDto) {
    return this.asistenciaService.findAll(filters);
  }

  @Get('fecha/:fecha/turno/:turno')
  @RequierePermiso('usuarios:ver')
  findByFechaAndTurno(
    @Param('fecha') fecha: string,
    @Param('turno') turno: TurnoPersonal,
  ) {
    return this.asistenciaService.findByFechaAndTurno(fecha, turno);
  }

  @Delete(':id')
  @RequierePermiso('usuarios:editar')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.asistenciaService.remove(id);
  }

  @Post('notas')
  @RequierePermiso('usuarios:editar')
  async actualizarNotas(
    @Body() body: { fecha: string; turno?: TurnoPersonal; notas: string },
  ) {
    return this.asistenciaService.actualizarNotasDia(body.fecha, body.turno, body.notas);
  }

  @Get('reporte/pdf/diario')
  @RequierePermiso('usuarios:ver')
  async reporteDiario(
    @Res() res: Response,
    @Query('fecha') fecha: string,
    @Query('turno') turno?: TurnoPersonal,
  ) {
    const buffer = await this.reportesService.generarPdfDiario(fecha, turno);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=asistencia_${fecha}.pdf`);
    res.end(buffer);
  }

  @Get('reporte/pdf/semanal')
  @RequierePermiso('usuarios:ver')
  async reporteSemanal(
    @Res() res: Response,
    @Query('fecha_inicio') fechaInicio: string,
    @Query('fecha_fin') fechaFin: string,
  ) {
    const buffer = await this.reportesService.generarPdfSemana(fechaInicio, fechaFin);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=asistencia_semanal_${fechaInicio}.pdf`);
    res.end(buffer);
  }

  @Get('reporte/pdf/mensual')
  @RequierePermiso('usuarios:ver')
  async reporteMensual(
    @Res() res: Response,
    @Query('mes') mes: number,
    @Query('anio') anio: number,
  ) {
    const buffer = await this.reportesService.generarPdfMes(mes, anio);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=asistencia_${anio}_${String(mes).padStart(2, '0')}.pdf`);
    res.end(buffer);
  }
}
