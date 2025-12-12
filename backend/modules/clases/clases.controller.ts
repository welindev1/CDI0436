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
import { ClasesService } from './clases.service';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { FilterClaseDto } from './dto/filter-clase.dto';
import { AgregarBeneficiariosDto } from './dto/agregar-beneficiarios.dto';

@Controller('clases')
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClaseDto: CreateClaseDto) {
    return this.clasesService.create(createClaseDto);
  }

  @Get()
  findAll(@Query() filters: FilterClaseDto) {
    return this.clasesService.findAll(filters);
  }

  @Get('tutor/:tutorId')
  findByTutor(@Param('tutorId', ParseUUIDPipe) tutorId: string) {
    return this.clasesService.findByTutor(tutorId);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.clasesService.findByCodigo(codigo);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clasesService.findOne(id);
  }

  @Get(':id/estadisticas')
  getEstadisticas(@Param('id', ParseUUIDPipe) id: string) {
    return this.clasesService.getEstadisticas(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateClaseDto: UpdateClaseDto
  ) {
    return this.clasesService.update(id, updateClaseDto);
  }

  @Post(':id/beneficiarios')
  agregarBeneficiarios(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() agregarBeneficiariosDto: AgregarBeneficiariosDto
  ) {
    return this.clasesService.agregarBeneficiarios(id, agregarBeneficiariosDto);
  }

  @Delete(':id/beneficiarios/:beneficiarioId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerBeneficiario(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('beneficiarioId', ParseUUIDPipe) beneficiarioId: string
  ) {
    return this.clasesService.removerBeneficiario(id, beneficiarioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clasesService.remove(id);
  }

  @Patch(':id/desactivar')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.clasesService.softDelete(id);
  }
}