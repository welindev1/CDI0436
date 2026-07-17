import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonoRegalo } from './bono-regalo.entity';
import { BonosService } from './bonos.service';
import { BonosController } from './bonos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BonoRegalo])],
  controllers: [BonosController],
  providers: [BonosService],
  exports: [BonosService, TypeOrmModule],
})
export class BonosModule {}
