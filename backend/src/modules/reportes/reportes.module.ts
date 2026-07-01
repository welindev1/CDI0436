import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Reporte } from './reporte.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reporte])],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService, TypeOrmModule],
})
export class ReportesModule {}
