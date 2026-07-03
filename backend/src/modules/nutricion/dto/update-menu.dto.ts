import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateMenuNutricionDto {
  @IsOptional()
  @IsString()
  titulo_menu?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  meriendas_servidas?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
