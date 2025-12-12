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
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { FilterHorarioDto } from './dto/filter-horario.dto';

@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horariosService.create(createHorarioDto);
  }

  @Get()
  findAll(@Query() filters: FilterHorarioDto) {
    return this.horariosService.findAll(filters);
  }

  @Get('disponibles')
  findDisponibles() {
    return this.horariosService.findDisponibles();
  }

  @Get('dia/:dia')
  findByDia(@Param('dia') dia: string) {
    return this.horariosService.findByDia(dia);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.horariosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateHorarioDto: UpdateHorarioDto
  ) {
    return this.horariosService.update(id, updateHorarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.horariosService.remove(id);
  }

  @Patch(':id/desactivar')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.horariosService.softDelete(id);
  }
}