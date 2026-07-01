import { IsUUID, IsDateString, IsBoolean, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AsistenciaBeneficiarioDto {
  @IsUUID()
  beneficiario_id: string;

  @IsBoolean()
  presente: boolean;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class RegistrarAsistenciaSupervivenciaDto {
  @IsDateString()
  fecha: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsistenciaBeneficiarioDto)
  asistencias: AsistenciaBeneficiarioDto[];
}
