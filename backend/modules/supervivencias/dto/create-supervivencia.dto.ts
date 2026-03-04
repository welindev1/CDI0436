import { IsString, IsOptional, IsInt, Min, MaxLength, IsBoolean } from 'class-validator';

export class CreateSupervivenciaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  codigo?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  capacidad_maxima?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
