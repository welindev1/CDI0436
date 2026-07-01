import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WebhookPayload {
  evento: 'ayuda_aprobada' | 'ayuda_rechazada';
  ayuda: {
    id: string;
    nombre_beneficiario: string;
    codigo_beneficiario: string;
    nombre_madre: string;
    nombre_tutor: string;
    tipo: string;
    tipo_especificacion?: string;
    telefono?: string;
    detalle: string;
    estado: string;
  };
  fecha: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookUrl: string;

  constructor(private configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL') || '';
  }

  async enviarWebhook(payload: WebhookPayload): Promise<boolean> {
    if (!this.webhookUrl) {
      this.logger.warn('N8N_WEBHOOK_URL no está configurado');
      return false;
    }

    try {
      this.logger.log(`Enviando webhook a n8n: ${payload.evento}`);

      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos timeout
      });

      this.logger.log(`Webhook enviado exitosamente. Status: ${response.status}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error enviando webhook a n8n: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      return false;
    }
  }

  async notificarCambioEstado(ayuda: any, nuevoEstado: string): Promise<void> {
    const evento = nuevoEstado === 'aprobada' ? 'ayuda_aprobada' : 'ayuda_rechazada';

    const payload: WebhookPayload = {
      evento,
      ayuda: {
        id: ayuda.id,
        nombre_beneficiario: ayuda.nombre_beneficiario,
        codigo_beneficiario: ayuda.codigo_beneficiario,
        nombre_madre: ayuda.nombre_madre,
        nombre_tutor: ayuda.nombre_tutor,
        tipo: ayuda.tipo,
        tipo_especificacion: ayuda.tipo_especificacion,
        telefono: ayuda.telefono,
        detalle: ayuda.detalle,
        estado: nuevoEstado,
      },
      fecha: new Date().toISOString(),
    };

    // Enviar de forma asíncrona (no bloquea la respuesta)
    this.enviarWebhook(payload).catch(err => {
      this.logger.error('Error en webhook asíncrono:', err);
    });
  }
}
