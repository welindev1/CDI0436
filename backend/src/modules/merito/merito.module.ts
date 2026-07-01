import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeritoController } from './merito.controller';
import { MeritoService } from './merito.service';
import { PeriodoMerito } from './periodo-merito.entity';
import { NotaMerito } from './nota-merito.entity';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PeriodoMerito, NotaMerito, Beneficiario]),
  ],
  controllers: [MeritoController],
  providers: [MeritoService],
  exports: [MeritoService],
})
export class MeritoModule {}
