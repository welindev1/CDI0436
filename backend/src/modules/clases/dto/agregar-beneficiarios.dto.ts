import { IsArray, ArrayMinSize, IsUUID } from 'class-validator';

export class AgregarBeneficiariosDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  beneficiarioIds: string[];
}
