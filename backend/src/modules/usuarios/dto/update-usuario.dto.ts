import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['tenantId'] as const)
) {
  // Campo interno para hash da senha (não exposto na API)
  senhaHash?: string;
}