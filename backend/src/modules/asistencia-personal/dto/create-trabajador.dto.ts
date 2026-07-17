import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class CreateTrabajadorDto {
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

  @IsString()
  @MaxLength(100)
  @IsOptional()
  correo?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
