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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { DocumentosUsuarioService } from './documentos-usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FilterDocumentoUsuarioDto } from './dto/filter-documento-usuario.dto';
import { TipoDocumentoUsuario } from './documento-usuario.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly documentosService: DocumentosUsuarioService,
  ) {}

  @Post()
  @RequierePermiso('usuarios:crear')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @RequierePermiso('usuarios:ver')
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @RequierePermiso('usuarios:ver')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @RequierePermiso('usuarios:editar')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch(':id/cambiar-password')
  changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usuariosService.changePassword(id, changePasswordDto);
  }

  @Patch(':id/reset-password')
  @RequierePermiso('usuarios:editar')
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.usuariosService.resetPassword(id, resetPasswordDto.password);
  }

  @Delete(':id')
  @RequierePermiso('usuarios:eliminar')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.remove(id);
  }

  @Patch(':id/desactivar')
  @RequierePermiso('usuarios:editar')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.softDelete(id);
  }

  @Post(':id/documentos')
  @UseInterceptors(FileInterceptor('archivo'))
  @RequierePermiso('usuarios:editar')
  @HttpCode(HttpStatus.CREATED)
  async subirDocumento(
    @Param('id', ParseUUIDPipe) usuarioId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('tipo_documento') tipo_documento: TipoDocumentoUsuario,
    @Body('anio') anio: string,
    @Body('notas') notas: string,
    @CurrentUser() user: any,
  ) {
    if (!tipo_documento || !Object.values(TipoDocumentoUsuario).includes(tipo_documento)) {
      throw new BadRequestException('Tipo de documento inválido');
    }

    const anioNum = parseInt(anio, 10);
    if (isNaN(anioNum) || anioNum < 2000 || anioNum > 2100) {
      throw new BadRequestException('Año inválido. Debe estar entre 2000 y 2100');
    }

    return this.documentosService.subirDocumento(
      usuarioId,
      file,
      tipo_documento,
      anioNum,
      notas,
      user.id,
    );
  }

  @Get(':id/documentos')
  @RequierePermiso('usuarios:ver')
  async findAllDocumentos(
    @Param('id', ParseUUIDPipe) usuarioId: string,
    @Query() filters: FilterDocumentoUsuarioDto,
  ) {
    return this.documentosService.findAll(usuarioId, filters);
  }

  @Get('documentos/tipos')
  @RequierePermiso('usuarios:ver')
  getTiposDocumento() {
    return this.documentosService.getTipos();
  }

  @Get('documentos/:docId')
  @RequierePermiso('usuarios:ver')
  findOneDocumento(@Param('docId', ParseUUIDPipe) docId: string) {
    return this.documentosService.findOne(docId);
  }

  @Delete('documentos/:docId')
  @RequierePermiso('usuarios:editar')
  removeDocumento(@Param('docId', ParseUUIDPipe) docId: string) {
    return this.documentosService.remove(docId);
  }
}
