import { IsOptional, IsString } from 'class-validator';

export class FilterBonoRegaloDto {
  @IsString()
  @IsOptional()
  mes?: string;

  @IsString()
  @IsOptional()
  entregado?: string;

  @IsString()
  @IsOptional()
  buscar?: string;
}
