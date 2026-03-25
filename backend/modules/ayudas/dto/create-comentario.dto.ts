import { IsString, IsNotEmpty } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El contenido del comentario es requerido' })
  contenido: string;

  @IsString()
  @IsNotEmpty({ message: 'El autor es requerido' })
  autor: string;
}
