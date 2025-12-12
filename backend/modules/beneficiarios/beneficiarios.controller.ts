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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express'; // <-- CORRECTO
import { BeneficiariosService } from './beneficiarios.service';
import { CreateBeneficiarioDto } from './dto/create-beneficiario.dto';
import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';
import { FilterBeneficiarioDto } from './dto/filter-beneficiario.dto';
import { AsignarClaseDto } from './dto/asignar-clase.dto';
import { ImportOptionsDto } from './dto/import-beneficiarios.dto';

@Controller('beneficiarios')
export class BeneficiariosController {
  constructor(private readonly beneficiariosService: BeneficiariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBeneficiarioDto: CreateBeneficiarioDto) {
    return this.beneficiariosService.create(createBeneficiarioDto);
  }

  @Get()
  findAll(@Query() filters: FilterBeneficiarioDto) {
    return this.beneficiariosService.findAll(filters);
  }

  @Get('clase/:claseId')
  findByClase(@Param('claseId', ParseUUIDPipe) claseId: string) {
    return this.beneficiariosService.findByClase(claseId);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.beneficiariosService.findByCodigo(codigo);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.beneficiariosService.findOne(id);
  }

  @Get(':id/estadisticas')
  getEstadisticas(@Param('id', ParseUUIDPipe) id: string) {
    return this.beneficiariosService.getEstadisticas(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateBeneficiarioDto: UpdateBeneficiarioDto
  ) {
    return this.beneficiariosService.update(id, updateBeneficiarioDto);
  }

  @Post(':id/asignar-clases')
  asignarClases(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() asignarClaseDto: AsignarClaseDto
  ) {
    return this.beneficiariosService.asignarClases(id, asignarClaseDto);
  }

  @Delete(':id/clases/:claseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerDeClase(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('claseId', ParseUUIDPipe) claseId: string
  ) {
    return this.beneficiariosService.removerDeClase(id, claseId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.beneficiariosService.remove(id);
  }

  @Patch(':id/desactivar')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.beneficiariosService.softDelete(id);
  }

  @Post('importar')
  @UseInterceptors(FileInterceptor('file'))
  async importar(
    @UploadedFile() file: Express.Multer.File,
    @Body() options?: ImportOptionsDto
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('El archivo debe ser un Excel (.xlsx o .xls)');
    }

    return await this.beneficiariosService.importarDesdeExcel(file.buffer, options);
  }

  @Get('plantilla/descargar')
  async descargarPlantilla(@Res() res: Response) {
    const buffer = await this.beneficiariosService.generarPlantillaExcel();
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=plantilla_beneficiarios.xlsx',
      'Content-Length': buffer.length
    });

    res.send(buffer);
  }

  @Get('exportar')
  async exportar(
    @Query() filters: FilterBeneficiarioDto,
    @Res() res: Response
  ) {
    const buffer = await this.beneficiariosService.exportarAExcel(filters);
    
    const fecha = new Date().toISOString().split('T')[0];
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=beneficiarios_${fecha}.xlsx`,
      'Content-Length': buffer.length
    });

    res.send(buffer);
  }
}
