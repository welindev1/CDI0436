import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFotoEntregaDto {
  @IsString()
  @IsNotEmpty({ message: 'La foto de entrega es requerida' })
  foto_entrega_url: string;
}
