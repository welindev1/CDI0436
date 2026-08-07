import {
  IsString,
  IsOptional,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateBonoRegaloDto {
  @IsString()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @MaxLength(200)
  beneficiario_nombre: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  padre_nombre?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  cedula?: string;

  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return 0;
    const cleaned = String(value).replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  })
  monto: number;

  @IsString()
  @MaxLength(100)
  mes: string;

  @IsString()
  @IsOptional()
  expira?: string;

  @IsString()
  @IsOptional()
  beneficiario_id?: string;
}

export class CreateBonosRegaloLoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBonoRegaloDto)
  bonos: CreateBonoRegaloDto[];
}

export class MarcarEntregadoDto {
  @IsString()
  @IsOptional()
  foto_entrega?: string;
}
