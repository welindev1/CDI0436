import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { TipoDocumentoUsuario } from '../documento-usuario.entity';

export class FilterDocumentoUsuarioDto {
  @IsOptional()
  @IsEnum(TipoDocumentoUsuario)
  tipo_documento?: TipoDocumentoUsuario;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  año?: number;
}
