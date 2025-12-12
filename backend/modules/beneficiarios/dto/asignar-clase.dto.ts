import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class AsignarClaseDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  claseIds: string[];
}