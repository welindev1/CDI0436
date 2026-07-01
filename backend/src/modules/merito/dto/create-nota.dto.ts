import { IsUUID, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { CicloEducativo } from '../nota-merito.entity';

export class CreateNotaDto {
  @IsUUID()
  beneficiario_id: string;

  @IsEnum(CicloEducativo)
  ciclo: CicloEducativo;

  @IsNumber()
  @Min(1)
  @Max(6)
  curso: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  matematicas: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  lengua_espanola: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  naturales: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  sociales: number;
}
