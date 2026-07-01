import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoAyuda } from '../ayuda.entity';

export class UpdateEstadoAyudaDto {
  @IsEnum(EstadoAyuda, { message: 'El estado debe ser válido (pendiente, aprobada, rechazada)' })
  @IsNotEmpty()
  estado: EstadoAyuda;
}
