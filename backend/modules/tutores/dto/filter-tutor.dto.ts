import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class FilterTutorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  especialidad?: string;
}
