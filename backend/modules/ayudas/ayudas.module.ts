import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AyudasService } from './ayudas.service';
import { AyudasController } from './ayudas.controller';
import { Ayuda } from './ayuda.entity';
import { WhatsappService } from './whatsapp.service';
import { WebhookService } from './webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ayuda])],
  controllers: [AyudasController],
  providers: [AyudasService, WhatsappService, WebhookService],
})
export class AyudasModule {}
