import { IsString, IsEmail, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';

export class CreateBeneficiarioDto {
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  telefono?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  padre_tutor?: string;

  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: string;

  @IsString()
  @IsOptional()
  foto_url?: string;

  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}