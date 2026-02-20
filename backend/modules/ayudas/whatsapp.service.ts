import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || '';
    this.apiUrl = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`;
  }

  async enviarMensaje(telefono: string, mensaje: string): Promise<boolean> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('WhatsApp no configurado: faltan WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN');
      return false;
    }

    // Limpiar número: solo dígitos
    const telefonoLimpio = telefono.replace(/[^0-9]/g, '');

    if (!telefonoLimpio || telefonoLimpio.length < 10) {
      this.logger.warn(`Número de teléfono inválido: ${telefono}`);
      return false;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: telefonoLimpio,
          type: 'text',
          text: {
            body: mensaje,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        this.logger.log(`Mensaje de WhatsApp enviado a ${telefonoLimpio}`);
        return true;
      } else {
        this.logger.error(`Error al enviar WhatsApp: ${JSON.stringify(data)}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error de conexión al enviar WhatsApp: ${error}`);
      return false;
    }
  }
}
