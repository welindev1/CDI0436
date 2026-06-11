import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Beneficiario } from './beneficiario.entity';

// Tipos soportados:
// 'educativo'  - Galería de imágenes con título, descripción y fecha
// 'registro'   - Nota con múltiples fotos, texto y fecha de evento
// 'documentos' - Título, detalle, imagen(es) y PDFs, sin fecha de evento
// 'otros'      - Expedientes legacy creados anteriormente

@Entity('beneficiario_expedientes')
export class BeneficiarioExpediente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Beneficiario, (beneficiario) => beneficiario.expedientes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'beneficiario_id' })
  beneficiario: Beneficiario;

  // Tipo de entrada: 'registro' | 'galeria' | 'libre' (legado)
  @Column({ type: 'varchar', length: 50, default: 'libre' })
  tipo: string;

  // Título principal de la entrada
  @Column({ type: 'varchar', length: 255, nullable: true })
  titulo: string;

  // Para galerías: controla si se muestra el título sobre la imagen
  @Column({ type: 'boolean', default: true })
  mostrar_titulo: boolean;

  // Contenido de texto (nota, descripción, detalles del operativo, etc.)
  @Column({ type: 'text', nullable: true })
  contenido: string;

  // Fecha del evento (cumpleaños, operativo médico, etc.) - opcional
  @Column({ type: 'date', nullable: true })
  fecha_evento: Date;

  // Imagen principal (base64) - para registros o imagen destacada
  @Column({ type: 'text', nullable: true })
  imagen_base64: string;

  // Galería de imágenes adicionales en JSON:
  // [{ base64: string, titulo?: string, descripcion?: string }]
  @Column({ type: 'jsonb', nullable: true })
  imagenes_galeria: Array<{
    base64: string;
    titulo?: string;
    descripcion?: string;
  }>;

  // PDFs adjuntos en JSON:
  // [{ nombre: string, base64_pdf: string }]
  @Column({ type: 'jsonb', nullable: true })
  pdfs: Array<{
    nombre: string;
    base64_pdf: string;
  }>;

  // Etiqueta de color para categorizar visualmente
  // Valores: 'azul' | 'verde' | 'rojo' | 'amarillo' | 'morado' | 'gris'
  @Column({ type: 'varchar', length: 20, nullable: true })
  etiqueta_color: string;

  @CreateDateColumn()
  creado_en: Date;
}
