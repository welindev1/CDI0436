import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  Matches,
} from 'class-validator';
import { DiaSemana } from '../horario.entity';

export class CreateHorarioDto {
  @IsEnum(DiaSemana)
  dia: DiaSemana;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'hora_inicio debe estar en formato HH:MM (24 horas)',
  })
  hora_inicio: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'hora_fin debe estar en formato HH:MM (24 horas)',
  })
  hora_fin: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
