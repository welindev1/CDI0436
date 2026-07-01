import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { EstadoAsistencia } from '../asistencia.entity';

export class FilterAsistenciaDto {
  @IsOptional()
  @IsUUID()
  claseId?: string;

  @IsOptional()
  @IsUUID()
  beneficiarioId?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsEnum(EstadoAsistencia)
  estado?: EstadoAsistencia;
}