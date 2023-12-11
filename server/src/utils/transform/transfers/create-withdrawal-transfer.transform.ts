import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { TransferTypeEnum } from '../../../resources/transfers/transfer-types.enum';
import { TransferStatusesService } from '../../../resources/transfer-statuses/transfer-statuses.service';
import { TransferStatusEnum } from '../../../resources/transfer-statuses/transfer-status.enum';
import { TransferTypesService } from '../../../resources/transfer-types/transfer-types.service';
import { CreateWithdrawalTransferDto } from '../../../resources/transfers/dto/create-withdrawal-transfer.dto';

@Injectable()
export class CreateWithdrawalTransferTransform implements PipeTransform {
  constructor(
    private readonly statusesService: TransferStatusesService,
    private readonly typesService: TransferTypesService,
  ) {}

  async transform(
    dto: CreateWithdrawalTransferDto,
    _metadata: ArgumentMetadata,
  ) {
    const withdrawalType = await this.typesService.findOneOrFail({
      name: TransferTypeEnum.withdrawal,
    });

    dto.typeId = withdrawalType.id;

    const status = await this.statusesService.findOneOrFail({
      name: TransferStatusEnum.pending,
    });
    dto.statusId = status.id;

    return dto;
  }
}
