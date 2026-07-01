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
import { TutoresService } from './tutores.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { FilterTutorDto } from './dto/filter-tutor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';

@Controller('tutores')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class TutoresController {
  constructor(private readonly tutoresService: TutoresService) {}

  @Post()
  @RequierePermiso('tutores:crear')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTutorDto: CreateTutorDto) {
    return this.tutoresService.create(createTutorDto);
  }

  @Get()
  @RequierePermiso('tutores:ver')
  findAll(@Query() filters: FilterTutorDto) {
    return this.tutoresService.findAll(filters);
  }

  @Get(':id')
  @RequierePermiso('tutores:ver')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutoresService.findOne(id);
  }

  @Patch(':id')
  @RequierePermiso('tutores:editar')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTutorDto: UpdateTutorDto,
  ) {
    return this.tutoresService.update(id, updateTutorDto);
  }

  @Delete(':id')
  @RequierePermiso('tutores:eliminar')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutoresService.remove(id);
  }

  @Patch(':id/desactivar')
  @RequierePermiso('tutores:editar')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutoresService.softDelete(id);
  }
}
