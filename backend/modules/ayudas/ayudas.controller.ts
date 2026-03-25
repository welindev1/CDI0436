import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseUUIDPipe } from '@nestjs/common';
import { AyudasService } from './ayudas.service';
import { CreateAyudaDto } from './dto/create-ayuda.dto';
import { UpdateEstadoAyudaDto } from './dto/update-estado-ayuda.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import type { Response } from 'express';

@Controller('ayudas')
export class AyudasController {
  constructor(private readonly ayudasService: AyudasService) {}

  @Post()
  create(@Body() createAyudaDto: CreateAyudaDto) {
    return this.ayudasService.create(createAyudaDto);
  }

  @Get()
  findAll() {
    return this.ayudasService.findAll();
  }

  @Get('exportar')
  async exportar(@Res() res: Response) {
    const buffer = await this.ayudasService.exportarAExcel();

    const fecha = new Date().toISOString().split('T')[0];
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=ayudas_${fecha}.xlsx`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ayudasService.findOne(id);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id', ParseUUIDPipe) id: string, @Body() updateEstadoDto: UpdateEstadoAyudaDto) {
    return this.ayudasService.updateEstado(id, updateEstadoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ayudasService.remove(id);
  }

  // Endpoints para comentarios
  @Post(':id/comentarios')
  createComentario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createComentarioDto: CreateComentarioDto,
  ) {
    return this.ayudasService.createComentario(id, createComentarioDto);
  }

  @Get(':id/comentarios')
  getComentarios(@Param('id', ParseUUIDPipe) id: string) {
    return this.ayudasService.getComentarios(id);
  }
}
