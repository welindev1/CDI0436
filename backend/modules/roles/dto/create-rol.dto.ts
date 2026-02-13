import { IsString, IsOptional, IsArray, IsBoolean, MaxLength, IsUUID } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  es_super_admin?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permisos_ids?: string[];
}
