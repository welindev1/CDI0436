import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
} from 'class-validator';

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

  @IsUUID()
  @IsOptional()
  usuarioId?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
