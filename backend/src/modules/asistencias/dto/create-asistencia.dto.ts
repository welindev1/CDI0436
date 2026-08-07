import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoAsistencia } from '../asistencia.entity';

export class CreateAsistenciaDto {
  @IsUUID()
  claseId: string;

  @IsUUID()
  beneficiarioId: string;

  @IsDateString()
  fecha: string;

  @IsEnum(EstadoAsistencia)
  estado: EstadoAsistencia;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  hora_registro?: string;
}
