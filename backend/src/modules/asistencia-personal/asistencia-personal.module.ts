import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from './trabajador.entity';
import { AsistenciaPersonal } from './asistencia-personal.entity';
import { AsistenciaPersonalService } from './asistencia-personal.service';
import { ReportesAsistenciaService } from './reportes-asistencia.service';
import { AsistenciaPersonalController } from './asistencia-personal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Trabajador, AsistenciaPersonal])],
  controllers: [AsistenciaPersonalController],
  providers: [AsistenciaPersonalService, ReportesAsistenciaService],
  exports: [
    AsistenciaPersonalService,
    ReportesAsistenciaService,
    TypeOrmModule,
  ],
})
export class AsistenciaPersonalModule {}
