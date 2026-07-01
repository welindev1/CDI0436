import { IsString, IsEnum, IsOptional, IsInt, MinLength, Min } from 'class-validator';
import { TandaNutricion } from '../menu-nutricion.entity';

export class CreateMenuNutricionDto {
  @IsString()
  fecha: string;

  @IsEnum(TandaNutricion)
  tanda: TandaNutricion;

  @IsString()
  @MinLength(1)
  titulo_menu: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  meriendas_servidas?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
