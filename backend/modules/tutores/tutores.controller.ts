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
} from '@nestjs/common';
import { TutoresService } from './tutores.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { FilterTutorDto } from './dto/filter-tutor.dto';

@Controller('tutores')
export class TutoresController {
  constructor(private readonly tutoresService: TutoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTutorDto: CreateTutorDto) {
    return this.tutoresService.create(createTutorDto);
  }

  @Get()
  findAll(@Query() filters: FilterTutorDto) {
    return this.tutoresService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTutorDto: UpdateTutorDto,
  ) {
    return this.tutoresService.update(id, updateTutorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutoresService.remove(id);
  }

  @Patch(':id/desactivar')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutoresService.softDelete(id);
  }
}
