import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { TipoDocumentoUsuario } from '../documento-usuario.entity';

export class CreateDocumentoUsuarioDto {
  @IsEnum(TipoDocumentoUsuario)
  tipo_documento: TipoDocumentoUsuario;

  @IsInt()
  @Min(2000)
  @Max(2100)
  año: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  nombre_original?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
