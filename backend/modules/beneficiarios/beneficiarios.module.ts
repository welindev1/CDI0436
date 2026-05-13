import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiariosService } from './beneficiarios.service';
import { BeneficiariosController } from './beneficiarios.controller';
import { Beneficiario } from './beneficiario.entity';
import { Clase } from '../clases/clase.entity';
import { BeneficiarioExpediente } from './beneficiario-expediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Beneficiario, BeneficiarioExpediente, Clase])],
  controllers: [BeneficiariosController],
  providers: [BeneficiariosService],
  exports: [BeneficiariosService, TypeOrmModule],
})
export class BeneficiariosModule {}