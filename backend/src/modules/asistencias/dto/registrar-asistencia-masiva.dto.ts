import { IsUUID, IsDateString, IsArray, ValidateNested, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAsistencia } from '../asistencia.entity';

class AsistenciaIndividualDto {
  @IsUUID()
  beneficiarioId: string;

  @IsEnum(EstadoAsistencia)
  estado: EstadoAsistencia;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class RegistrarAsistenciaMasivaDto {
  @IsUUID()
  claseId: string;

  @IsDateString()
  fecha: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsistenciaIndividualDto)
  asistencias: AsistenciaIndividualDto[];
}