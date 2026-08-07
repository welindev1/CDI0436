import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  Matches,
} from 'class-validator';
import { TurnoPersonal } from '../asistencia-personal.entity';

export class MarcarEntradaDto {
  @IsDateString()
  fecha: string;

  @IsEnum(TurnoPersonal)
  @IsOptional()
  turno?: TurnoPersonal;

  @IsString()
  @IsOptional()
  notas?: string;
}

export class MarcarSalidaDto {
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Hora inválida. Formato: HH:MM',
  })
  hora_salida: string;
}

export class CreateAsistenciaPersonalDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Hora de entrada inválida. Formato: HH:MM',
  })
  hora_entrada: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Hora de salida inválida. Formato: HH:MM',
  })
  hora_salida?: string;

  @IsEnum(TurnoPersonal)
  @IsOptional()
  turno?: TurnoPersonal;

  @IsString()
  @IsOptional()
  notas?: string;
}
