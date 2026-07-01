import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Reporte } from './reporte.entity';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<Reporte>) {
    return this.reportesService.create(data);
  }

  @Get()
  findAll() {
    return this.reportesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportesService.remove(id);
  }
}
