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
import { Beneficiario } from '../beneficiarios/beneficiario.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('bonos_regalo')
@Index('IDX_BONO_REGALO_BENEFICIARIO', ['beneficiario'])
@Index('IDX_BONO_REGALO_ENTREGADO', ['entregado'])
@Index('IDX_BONO_REGALO_MES', ['mes'])
export class BonoRegalo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  codigo: string;

  @Column({ length: 200 })
  beneficiario_nombre: string;

  @Column({ length: 200, nullable: true })
  padre_nombre: string;

  @Column({ length: 20, nullable: true })
  cedula: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ length: 100 })
  mes: string;

  @Column({ type: 'date', nullable: true })
  expira: Date;

  @Column({ default: false })
  entregado: boolean;

  @Column({ type: 'varchar', nullable: true })
  foto_entrega: string;

  @ManyToOne(() => Beneficiario, { nullable: true, eager: true })
  @JoinColumn({ name: 'beneficiario_id' })
  beneficiario: Beneficiario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'registrado_por_id' })
  registrado_por: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'entregado_por_id' })
  entregado_por: Usuario;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;
}
