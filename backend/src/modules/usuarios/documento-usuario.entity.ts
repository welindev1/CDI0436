import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

export enum TipoDocumentoUsuario {
  FIRMA = 'firma',
  ANTECEDENTES_PENALES = 'antecedentes_penales',
  EXAMEN_PROTECCION = 'examen_proteccion',
  VACACIONES = 'vacaciones',
  LICENCIAS = 'licencias',
  SUSPENSION = 'suspension',
  AMONESTACION = 'amonestacion',
  OTRO = 'otro',
}

@Entity('documentos_usuario')
@Index('IDX_DOC_USUARIO_COMPOSITE', ['usuario', 'tipo_documento', 'año'])
@Index('IDX_DOC_USUARIO_USUARIO_ID', ['usuario'])
@Index('IDX_DOC_USUARIO_TIPO', ['tipo_documento'])
@Index('IDX_DOC_USUARIO_ANIO', ['año'])
export class DocumentoUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({
    type: 'enum',
    enum: TipoDocumentoUsuario,
  })
  tipo_documento: TipoDocumentoUsuario;

  @Column({ type: 'int' })
  año: number;

  @Column({ type: 'text' })
  archivo_url: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_original: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'subido_por_id' })
  subido_por: Usuario;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
