import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupervivenciasService } from './supervivencias.service';
import { SupervivenciasController } from './supervivencias.controller';
import { Supervivencia } from './supervivencia.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supervivencia, Beneficiario])],
  controllers: [SupervivenciasController],
  providers: [SupervivenciasService],
  exports: [SupervivenciasService, TypeOrmModule],
})
export class SupervivenciasModule {}
