import { IsString, IsEmail, IsUUID, IsBoolean, MaxLength, IsOptional } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsUUID()
  rol_id?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
