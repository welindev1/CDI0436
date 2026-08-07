import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './usuario.entity';
import { DocumentoUsuario } from './documento-usuario.entity';
import { DocumentosUsuarioService } from './documentos-usuario.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, DocumentoUsuario])],
  controllers: [UsuariosController],
  providers: [UsuariosService, DocumentosUsuarioService],
  exports: [UsuariosService, DocumentosUsuarioService, TypeOrmModule],
})
export class UsuariosModule {}
