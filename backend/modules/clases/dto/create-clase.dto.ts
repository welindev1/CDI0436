import { IsString, IsOptional, IsUUID, IsInt, Min, MaxLength } from 'class-validator';

export class CreateClaseDto {
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

  @IsUUID()
  tutorId: string;

  @IsUUID()
  horarioId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  capacidad_maxima?: number;

  @IsOptional()
  activo?: boolean;
}