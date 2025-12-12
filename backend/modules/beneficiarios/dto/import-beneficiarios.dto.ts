import { IsOptional, IsBoolean } from 'class-validator';

export class ImportOptionsDto {
  @IsOptional()
  @IsBoolean()
  actualizarExistentes?: boolean; // Si true, actualiza los beneficiarios que ya existen por código

  @IsOptional()
  @IsBoolean()
  omitirErrores?: boolean; // Si true, continúa aunque haya errores en algunas filas
}