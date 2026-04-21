import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutricionService } from './nutricion.service';
import { NutricionController } from './nutricion.controller';
import { MenuNutricion } from './menu-nutricion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuNutricion])],
  controllers: [NutricionController],
  providers: [NutricionService],
  exports: [NutricionService, TypeOrmModule],
})
export class NutricionModule {}
