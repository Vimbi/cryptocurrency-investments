import { PartialType } from '@nestjs/swagger';
import { CreateTransferStatusDto } from './create-transfer-status.dto';

export class UpdateTransferStatusDto extends PartialType(
  CreateTransferStatusDto,
) {}
