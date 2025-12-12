import { IsUUID, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoAsistencia } from '../asistencia.entity';

export class MarcarTodosDto {
  @IsUUID()
  claseId: string;

  @IsDateString()
  fecha: string;

  @IsEnum(EstadoAsistencia)
  estado: EstadoAsistencia;

  @IsString()
  @IsOptional()
  observaciones?: string;
}