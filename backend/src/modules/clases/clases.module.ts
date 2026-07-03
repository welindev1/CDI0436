import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClasesService } from './clases.service';
import { ClasesController } from './clases.controller';
import { Clase } from './clase.entity';
import { Tutor } from '../tutores/tutor.entity';
import { Horario } from '../horarios/horario.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clase, Tutor, Horario, Beneficiario])],
  controllers: [ClasesController],
  providers: [ClasesService],
  exports: [ClasesService, TypeOrmModule],
})
export class ClasesModule {}
