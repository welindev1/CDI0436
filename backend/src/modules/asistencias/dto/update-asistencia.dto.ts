import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAsistenciaDto } from './create-asistencia.dto';

export class UpdateAsistenciaDto extends PartialType(
  OmitType(CreateAsistenciaDto, [
    'claseId',
    'beneficiarioId',
    'fecha',
  ] as const),
) {}
