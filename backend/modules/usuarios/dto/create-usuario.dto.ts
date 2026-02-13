import { IsString, IsEmail, IsUUID, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsUUID()
  rol_id: string;
}
