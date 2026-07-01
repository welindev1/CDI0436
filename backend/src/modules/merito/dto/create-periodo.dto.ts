import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsIn } from 'class-validator';

export class CreatePeriodoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  anio: number;

  @IsOptional()
  @IsString()
  @IsIn(['activo', 'cerrado'])
  estado?: string;
}
