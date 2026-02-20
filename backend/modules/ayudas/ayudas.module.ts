import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AyudasService } from './ayudas.service';
import { AyudasController } from './ayudas.controller';
import { Ayuda } from './ayuda.entity';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ayuda])],
  controllers: [AyudasController],
  providers: [AyudasService, WhatsappService],
})
export class AyudasModule {}
