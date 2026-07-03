import { PartialType } from '@nestjs/mapped-types';
import { CreateSupervivenciaDto } from './create-supervivencia.dto';

export class UpdateSupervivenciaDto extends PartialType(
  CreateSupervivenciaDto,
) {}
