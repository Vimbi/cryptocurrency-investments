import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateNetworkDto } from './create-network.dto';

export class UpdateNetworkDto extends PartialType(
  OmitType(CreateNetworkDto, ['currencyId'] as const),
) {}
