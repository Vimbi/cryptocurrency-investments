import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEnum } from './event.enum';
import { WithdrawalTransferCreatedEvent } from './dto/withdrawal-transfer-created.event';
import { errorMsgs } from '../../shared/error-messages';
import { TxIdAddedEvent } from './dto/tx-id-added.event';
import { ConfigService } from '@nestjs/config';
import { WithdrawalTransferCompletedEvent } from './dto/withdrawal-transfer-completed.event';
import { UsersService } from '../users/users.service';
import { DepositTransferCompletedEvent } from './dto/deposit-transfer-completed.event';
import { InvestmentCompletedEvent } from './dto/investment-completed.event';
import { TransferProcessedEvent } from './dto/transfer-processed.event';
import { TransferTypeEnum } from '../transfers/transfer-types.enum';
import { DepositTransferCanceledEvent } from './dto/deposit-transfer-canceled.event';
import { InjectQueue } from '@nestjs/bull';
import { TelegramQueueNameEnum } from '../telegram-bot/telegram-queue-name.enum';
import { Queue } from 'bull';
import { ITelegramSendMessage } from '../../types/telegram-bot/telegram-send-message.interface';
import { withdrawalTransferCreatedTelegramMessage } from '../telegram-bot/templates/withdrawal-transfer-created';
import { depositTransferCreatedTelegramMessage } from '../telegram-bot/templates/deposit-transfer-created';
import { transferCompletedTelegramMessage } from '../telegram-bot/templates/transfer-completed';
import { depositTransferCanceledTelegramMessage } from '../telegram-bot/templates/deposit-transfer-canceled';
import { investmentCompletedTelegramMessage } from '../telegram-bot/templates/investment-completed';
import { transferProcessedTelegramMessage } from '../telegram-bot/templates/transfer-processed';

@Injectable()
export class EventsListener {
  private readonly _adminChatId: string;
  private readonly _superAdminChatId: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    @InjectQueue(TelegramQueueNameEnum.sendMessage)
    private telegramQueue: Queue<ITelegramSendMessage>,
    private readonly usersService: UsersService,
  ) {
    this._adminChatId = this.configService.get('telegramBot.adminChatId');
    this._superAdminChatId = this.configService.get(
      'telegramBot.superAdminChatId',
    );
  }

  @OnEvent(EventEnum.withdrawalTransferCreated)
  async handleWithdrawalTransferCreatedEvent(
    event: WithdrawalTransferCreatedEvent,
  ) {
    try {
      const { amount, createdAt, id, userId } = event;

      const { email, firstName, lastName, surname } =
        await this.usersService.findOne({ id: userId });

      const fullName = `${lastName} ${firstName} ${surname}`;

      await this.telegramQueue.add({
        chat_id: this._adminChatId,
        text: withdrawalTransferCreatedTelegramMessage({
          transferId: id,
          amount,
          fullName,
          email,
          createdAt,
        }),
      });
    } catch (error) {
      this.logger.error(`${errorMsgs.transferWithdrawalCreatedEvent}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  @OnEvent(EventEnum.txIdAdded)
  async handleTxIdAddedEvent(event: TxIdAddedEvent) {
    try {
      const { id, txId, updatedAt, transferTypeName, userId, amount } = event;
      if (transferTypeName === TransferTypeEnum.deposit) {
        // TODO валидация и добавить в очередь

        const { email, firstName, lastName, surname } =
          await this.usersService.findOne({ id: userId });

        const fullName = `${lastName} ${firstName} ${surname}`;

        await this.telegramQueue.add({
          chat_id: this._adminChatId,
          text: depositTransferCreatedTelegramMessage({
            transferId: id,
            amount,
            fullName,
            email,
            txId,
            updatedAt,
          }),
        });
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.transferTxIdAddedEvent}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  @OnEvent(EventEnum.withdrawalTransferCompleted)
  async handleWithdrawalTransferCompletedEvent(
    event: WithdrawalTransferCompletedEvent,
  ) {
    try {
      const { amount, userId, txId, adminId, transferId } = event;

      await this.telegramQueue.add({
        chat_id: this._superAdminChatId,
        text: transferCompletedTelegramMessage({
          txId,
          amount,
          adminId,
          transferId,
          typeName: TransferTypeEnum.withdrawal,
        }),
      });
      // const { telegramChatId } = await this.usersService.findOne({
      //   id: userId,
      // });
      // if (telegramChatId) {
      // }
    } catch (error) {
      this.logger.error(`${errorMsgs.transferWithdrawalCompletedEvent}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  @OnEvent(EventEnum.depositTransferCompleted)
  async handleDepositTransferCompletedEvent(
    event: DepositTransferCompletedEvent,
  ) {
    try {
      const { amount, userId, txId, transferId, adminId } = event;
      if (this._superAdminChatId) {
        await this.telegramQueue.add({
          chat_id: this._superAdminChatId,
          text: transferCompletedTelegramMessage({
            txId,
            amount,
            adminId,
            transferId,
            typeName: TransferTypeEnum.deposit,
          }),
        });
      }

      // const { telegramChatId } = await this.usersService.findOne({
      //   id: userId,
      // });
      // if (telegramChatId) {
      //   await this.telegramBotApiService.sendMessage({
      //     chat_id: telegramChatId,
      //     text: `<b>Deposit transfer completed</b>\n<b>TxID:</b> ${txId}\n<b>Amount:</b> ${convertCentsToDollars(
      //       amount,
      //     )}$`,
      //   });
      // }
    } catch (error) {
      this.logger.error(`${errorMsgs.transferDepositCompletedEvent}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  @OnEvent(EventEnum.depositTransferCanceled)
  async handleDepositTransferCanceledEvent(
    event: DepositTransferCanceledEvent,
  ) {
    try {
      const { amount, txId, transferId, note, adminId } = event;
      if (this._superAdminChatId) {
        await this.telegramQueue.add({
          chat_id: this._superAdminChatId,
          text: depositTransferCanceledTelegramMessage({
            transferId,
            txId,
            amount,
            note,
            adminId,
          }),
        });
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.transferDepositCanceledEvent}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  @OnEvent(EventEnum.investmentCompleted)
  async handleInvestmentCompletedEvent(event: InvestmentCompletedEvent) {
    try {
      const { investmentDepositsAmount, income, userId } = event;
      const { telegramChatId } = await this.usersService.findOne({
        id: userId,
      });
      if (telegramChatId) {
        await this.telegramQueue.add({
          chat_id: telegramChatId,
          text: investmentCompletedTelegramMessage({
            investmentDepositsAmount,
            income,
          }),
        });
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.investmentCompletedEvent}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  @OnEvent(EventEnum.transferProcessed)
  async handleTransferProcessedEvent(event: TransferProcessedEvent) {
    try {
      const { txId, transferId, adminId, amount, type } = event;

      if (this._superAdminChatId && type === TransferTypeEnum.withdrawal) {
        await this.telegramQueue.add({
          chat_id: this._superAdminChatId,
          text: transferProcessedTelegramMessage({
            typeName: type,
            transferId,
            txId,
            amount,
            adminId,
          }),
        });
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.transferProcessedEvent}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }
}
