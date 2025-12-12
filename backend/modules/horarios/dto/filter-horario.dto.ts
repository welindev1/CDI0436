import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { DiaSemana } from '../horario.entity';

export class FilterHorarioDto {
  @IsOptional()
  @IsEnum(DiaSemana)
  dia?: DiaSemana;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
