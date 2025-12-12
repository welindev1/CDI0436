import { IsUUID, IsDateString, IsArray, ArrayMinSize, IsString, IsOptional } from 'class-validator';

export class JustificarMasivoDto {
  @IsUUID()
  claseId: string;

  @IsDateString()
  fecha: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  beneficiarioIds: string[];

  @IsString()
  @IsOptional()
  observaciones?: string;
}