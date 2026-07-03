import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterClaseDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsUUID()
  tutorId?: string;

  @IsOptional()
  @IsUUID()
  horarioId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activo?: boolean;
}
