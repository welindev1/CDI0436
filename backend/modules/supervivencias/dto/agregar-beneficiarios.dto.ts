import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class AgregarBeneficiariosSupervivenciaDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  beneficiarioIds: string[];
}
