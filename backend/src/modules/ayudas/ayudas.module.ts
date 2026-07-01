import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AyudasService } from './ayudas.service';
import { AyudasController } from './ayudas.controller';
import { Ayuda } from './ayuda.entity';
import { ComentarioAyuda } from './comentario-ayuda.entity';
import { WhatsappService } from './whatsapp.service';
import { WebhookService } from './webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ayuda, ComentarioAyuda])],
  controllers: [AyudasController],
  providers: [AyudasService, WhatsappService, WebhookService],
  exports: [AyudasService, TypeOrmModule],
})
export class AyudasModule {}
