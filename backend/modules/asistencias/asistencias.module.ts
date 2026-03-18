import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { Asistencia } from './asistencia.entity';
import { FotoAsistencia } from './foto-asistencia.entity';
import { Clase } from '../clases/clase.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia, FotoAsistencia, Clase, Beneficiario])],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService, TypeOrmModule],
})
export class AsistenciasModule {}