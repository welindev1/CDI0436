import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TipoAyuda } from '../ayuda.entity';

export class CreateAyudaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del beneficiario es requerido' })
  nombre_beneficiario: string;

  @IsString()
  @IsNotEmpty({ message: 'El código del beneficiario es requerido' })
  codigo_beneficiario: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la madre es requerido' })
  nombre_madre: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del tutor es requerido' })
  nombre_tutor: string;

  @IsEnum(TipoAyuda, { message: 'El tipo de ayuda debe ser valida (medica, alimentos, otros)' })
  @IsNotEmpty({ message: 'El tipo de ayuda es requerido' })
  tipo: TipoAyuda;

  @IsOptional()
  @IsString({ message: 'La especificación del tipo debe ser texto' })
  tipo_especificacion?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  telefono?: string;

  @IsString()
  @IsNotEmpty({ message: 'El detalle de la solicitud es requerido' })
  detalle: string;
}
