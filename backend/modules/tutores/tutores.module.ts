import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutoresService } from './tutores.service';
import { TutoresController } from './tutores.controller';
import { Tutor } from './tutor.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tutor, Usuario])],
  controllers: [TutoresController],
  providers: [TutoresService],
  exports: [TutoresService, TypeOrmModule],
})
export class TutoresModule {}
