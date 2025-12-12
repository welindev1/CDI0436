import { IsString, IsEmail, IsEnum, MinLength, MaxLength } from 'class-validator';
import { RolUsuario } from '../usuario.entity';

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

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}
