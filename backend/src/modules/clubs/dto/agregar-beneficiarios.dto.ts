import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class AgregarBeneficiariosClubDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  beneficiarioIds: string[];
}
