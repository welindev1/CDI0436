import { IsArray, IsUUID } from 'class-validator';

export class AsignarPermisosDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permisos_ids: string[];
}
