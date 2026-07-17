import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosUsuarioService } from './documentos-usuario.service';
import { CreateDocumentoUsuarioDto } from './dto/create-documento-usuario.dto';
import { FilterDocumentoUsuarioDto } from './dto/filter-documento-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class DocumentosUsuarioController {
  constructor(
    private readonly documentosService: DocumentosUsuarioService,
  ) {}

  @Post(':usuarioId/documentos')
  @UseInterceptors(FileInterceptor('archivo'))
  @RequierePermiso('usuarios:editar')
  async subirDocumento(
    @Param('usuarioId', ParseUUIDPipe) usuarioId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDocumentoUsuarioDto,
    @CurrentUser() user: any,
  ) {
    return this.documentosService.subirDocumento(
      usuarioId,
      file,
      body.tipo_documento,
      body.año,
      body.notas,
      user.id,
    );
  }

  @Get(':usuarioId/documentos')
  @RequierePermiso('usuarios:ver')
  async findAll(
    @Param('usuarioId', ParseUUIDPipe) usuarioId: string,
    @Query() filters: FilterDocumentoUsuarioDto,
  ) {
    return this.documentosService.findAll(usuarioId, filters);
  }

  @Get('documentos/:docId')
  @RequierePermiso('usuarios:ver')
  async findOne(@Param('docId', ParseUUIDPipe) docId: string) {
    return this.documentosService.findOne(docId);
  }

  @Delete('documentos/:docId')
  @RequierePermiso('usuarios:editar')
  async remove(@Param('docId', ParseUUIDPipe) docId: string) {
    await this.documentosService.remove(docId);
    return { message: 'Documento eliminado correctamente' };
  }

  @Get('documentos/tipos')
  @RequierePermiso('usuarios:ver')
  getTipos() {
    return this.documentosService.getTipos();
  }
}
