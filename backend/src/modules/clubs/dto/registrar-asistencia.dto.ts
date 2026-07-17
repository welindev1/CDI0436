import {
  IsUUID,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AsistenciaBeneficiarioClubDto {
  @IsUUID()
  beneficiario_id: string;

  @IsBoolean()
  presente: boolean;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class RegistrarAsistenciaClubDto {
  @IsDateString()
  fecha: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsistenciaBeneficiarioClubDto)
  asistencias: AsistenciaBeneficiarioClubDto[];
}
