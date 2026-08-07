import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { PermisosService } from './permisos.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AsignarPermisosDto } from './dto/asignar-permisos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permisosService: PermisosService,
  ) {}

  @Post()
  @RequierePermiso('roles:crear')
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  @Get()
  @RequierePermiso('roles:ver')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permisos')
  @RequierePermiso('roles:ver')
  findAllPermisos() {
    return this.permisosService.findAll();
  }

  @Get('permisos/agrupados')
  @RequierePermiso('roles:ver')
  findPermisosAgrupados() {
    return this.permisosService.findAllGroupedByModulo();
  }

  @Get(':id')
  @RequierePermiso('roles:ver')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @RequierePermiso('roles:editar')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return this.rolesService.update(id, updateRolDto);
  }

  @Patch(':id/permisos')
  @RequierePermiso('roles:editar')
  asignarPermisos(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() asignarPermisosDto: AsignarPermisosDto,
  ) {
    return this.rolesService.asignarPermisos(
      id,
      asignarPermisosDto.permisos_ids,
    );
  }

  @Delete(':id')
  @RequierePermiso('roles:eliminar')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
