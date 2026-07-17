import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoUsuario } from './documento-usuario.entity';
import { DocumentosUsuarioController } from './documentos-usuario.controller';
import { DocumentosUsuarioService } from './documentos-usuario.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoUsuario])],
  controllers: [DocumentosUsuarioController],
  providers: [DocumentosUsuarioService],
  exports: [DocumentosUsuarioService, TypeOrmModule],
})
export class DocumentosUsuarioModule {}
