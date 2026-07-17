import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoTutor } from '../tutor.entity';

export class FilterTutorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  especialidad?: string;

  @IsOptional()
  @IsEnum(TipoTutor)
  tipo?: TipoTutor;
}
