import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AyudasService } from './ayudas.service';
import { AyudasController } from './ayudas.controller';
import { Ayuda } from './ayuda.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ayuda])],
  controllers: [AyudasController],
  providers: [AyudasService],
})
export class AyudasModule {}
