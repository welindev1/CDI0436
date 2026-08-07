import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateClubDto {
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
  @IsOptional()
  tutor_id?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  capacidad_maxima?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
