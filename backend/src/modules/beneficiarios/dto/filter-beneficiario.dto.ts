import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterBeneficiarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activo?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  edadMin?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  edadMax?: number;

  @IsOptional()
  @IsString()
  padre_tutor?: string;
}
