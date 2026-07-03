import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  passwordActual: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  passwordNueva: string;
}
