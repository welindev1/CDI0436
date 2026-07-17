import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { TipoTutor } from '../tutor.entity';

export class CreateTutorDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  apellido?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  especialidad?: string;

  @IsEnum(TipoTutor)
  @IsOptional()
  tipo?: TipoTutor;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
