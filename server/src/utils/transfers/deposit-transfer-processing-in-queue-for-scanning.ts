import { EntityManager, IsNull, LessThan, Not } from 'typeorm';
import { Transfer } from '../../resources/transfers/entities/transfer.entity';
import { TransferStatusEnum } from '../../resources/transfer-statuses/transfer-status.enum';
import { TransferStatus } from '../../resources/transfer-statuses/entities/transfer-status.entity';
import { TransfersService } from '../../resources/transfers/transfers.service';
import { transferNotes } from '../../shared/messages';
import { TransferTypeEnum } from '../../resources/transfers/transfer-types.enum';
import { errorMsgs } from '../../shared/error-messages';
import { NetworkTokenTypeEnum } from '../../resources/networks/network-token-type.enum';
import { InternalServerErrorException } from '@nestjs/common';
import { TTransferScan } from '../../types/transfers/transfer-scan.interfaces';

export const depositTransferProcessingInQueueForScanning = async ({
  manager,
  transferId,
  networkTokenType,
  transfersService,
  scan,
}: {
  manager: EntityManager;
  transferId: string;
  networkTokenType: NetworkTokenTypeEnum;
  transfersService: TransfersService;
  scan: (data: TTransferScan) => Promise<void>;
}) => {
  const {
    type,
    network,
    txId,
    status,
    transaction,
    userId,
    amount,
    createdAt,
    fromAddress,
    currencyAmount,
  } = await manager.findOneOrFail(Transfer, {
    where: { id: transferId },
    relations: {
      type: true,
      network: {
        currency: true,
      },
      status: true,
      transaction: true,
    },
  });
  const {
    currency: { isSenderAddressRequired, symbol },
    depositAddress,
    tokenType,
  } = network;

  if (
    status.name === TransferStatusEnum.completed ||
    status.name === TransferStatusEnum.canceled ||
    transaction
  ) {
    return;
  }
  if (type.name !== TransferTypeEnum.deposit) {
    throw new InternalServerErrorException(errorMsgs.transferMustBeDeposit);
  }
  if (tokenType !== networkTokenType) {
    throw new InternalServerErrorException(errorMsgs.transferTokenTypeInvalid);
  }
  if (!txId) {
    throw new InternalServerErrorException(errorMsgs.transferHasNoTxId);
  }

  const statusCanceled = await manager.findOneOrFail(TransferStatus, {
    where: { name: TransferStatusEnum.canceled },
  });

  if (isSenderAddressRequired) {
    const transferWithSameOutgoingAddress = await manager.findOne(Transfer, {
      where: {
        fromAddress,
        txId: IsNull(),
        id: Not(transferId),
        statusId: Not(statusCanceled.id),
        createdAt: LessThan(createdAt),
      },
    });

    if (transferWithSameOutgoingAddress) return;
  }

  const transferWithSameTxId = await manager.findOne(Transfer, {
    where: {
      fromAddress,
      txId,
      id: Not(transferId),
      statusId: Not(statusCanceled.id),
      createdAt: LessThan(createdAt),
    },
  });
  if (transferWithSameTxId) {
    return await transfersService.cancel({
      manager,
      id: transferId,
      note: transferNotes.txIdAlreadyBeenUsed,
      txId,
      amount,
    });
  }
  return await scan({
    txId,
    manager,
    transferId,
    amount,
    fromAddress,
    currencySymbol: symbol,
    depositAddress,
    tokenType,
    currencyAmount,
    userId,
  });
};
