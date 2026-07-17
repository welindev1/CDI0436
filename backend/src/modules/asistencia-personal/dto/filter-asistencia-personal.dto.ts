import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { TurnoPersonal } from '../asistencia-personal.entity';

export class FilterAsistenciaPersonalDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  fecha_inicio?: string;

  @IsOptional()
  @IsString()
  fecha_fin?: string;

  @IsOptional()
  @IsEnum(TurnoPersonal)
  turno?: TurnoPersonal;
}
