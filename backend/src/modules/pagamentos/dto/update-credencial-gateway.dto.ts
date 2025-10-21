import { PartialType } from '@nestjs/swagger';
import { CreateCredencialGatewayDto } from './create-credencial-gateway.dto';

export class UpdateCredencialGatewayDto extends PartialType(CreateCredencialGatewayDto) {}