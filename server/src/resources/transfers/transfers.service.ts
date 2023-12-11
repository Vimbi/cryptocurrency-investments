import * as moment from 'moment';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOneOptions,
  FindOptionsWhere,
  IsNull,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { Transfer } from './entities/transfer.entity';
import { ICreateTransfer } from '../../types/transfers/create-transfer.interface';
import { ConfigService } from '@nestjs/config';
import { UpdateTxIdDto } from './dto/update-txid.dto';
import { TransferStatusesService } from '../transfer-statuses/transfer-statuses.service';
import { TransferStatusEnum } from '../transfer-statuses/transfer-status.enum';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionTypesService } from '../transaction-types/transaction-types.service';
import { TransactionTypeEnum } from '../transaction-types/transaction-type.enum';
import { TransferTypeEnum } from './transfer-types.enum';
import { FixedCurrencyRatesService } from '../fixed-currency-rates/fixed-currency-rates.service';
import {
  MAX_DECIMAL_PLACES,
  MAX_DECIMAL_PLACES_CURRENCY,
} from '../../utils/constants/common-constants';
import { UsersService } from '../users/users.service';
import { qbFindTransfers } from '../../utils/query-builders/find-transfers';
import { IGetTransfers } from '../../types/transfers/get-transfers.interface';
import { IProcessTransfer } from '../../types/transfers/process-transfer.interface';
import { ITransferCancel } from '../../types/transfers/transfer-cancel.interface';
import { ITransferCalculateAmount } from '../../types/transfers/transfer-calculate-amount.interace';
import { AccountStatementsService } from '../account-statements/account-statements.service';
import { convertCentsToDollars } from '../../utils/convert-cents-to-dollars';
import { Investment } from '../investments/entities/investment.entity';
import { WithdrawalTransferCreatedEvent } from '../events/dto/withdrawal-transfer-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEnum } from '../events/event.enum';
import { TxIdAddedEvent } from '../events/dto/tx-id-added.event';
import { WithdrawalTransferCompletedEvent } from '../events/dto/withdrawal-transfer-completed.event';
import { TransferProcessedEvent } from '../events/dto/transfer-processed.event';
import { IFindTransfer } from '../../types/transfers/find-transfer.interface';
import { TransferCode } from '../transfers-codes/entities/transfer-code.entity';
import { generateCode } from '../../utils/generate-code';
import { MailService } from '../mail/mail.service';
import { ISendWithdrawalCode } from '../../types/transfers/send-withdrawal-code.interface';
import { ICreateWithdrawalTransfer } from '../../types/transfers/create-withdrawal-transfer.interface';
import { TransferCodesService } from '../transfers-codes/transfer-codes.service';
import { IValidateConfirmWithdrawal } from '../../types/transfers/validate-confirm-withdrawal.interface';
import { IValidateConfirmDeposit } from '../../types/transfers/validate-confirm-deposit.interface';
import { transferNotes } from '../../shared/messages';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ICompleteTransferCreateTransaction } from '../../types/transfers/complete-transfer-create-transaction.interface';
import { TransferInfo } from '../transfer-info/entitites/transfer-info.entity';
import { DepositTransferCanceledEvent } from '../events/dto/deposit-transfer-canceled.event';
import { DepositTransferCompletedEvent } from '../events/dto/deposit-transfer-completed.event';

@Injectable()
export class TransfersService {
  private _maxDepositLimit: number;
  private _lifeSpan: number;
  private _depositMaxRequestsPerDay: number;
  private _minDepositLimit: number;
  private _minWithdrawalLimit: number;
  private _codeLength: number;
  constructor(
    @Inject(forwardRef(() => AccountStatementsService))
    private readonly accountStatementsService: AccountStatementsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
    private readonly fixedCurrencyRatesService: FixedCurrencyRatesService,
    @InjectRepository(Transfer)
    private repository: Repository<Transfer>,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    private readonly mailService: MailService,
    private readonly transferCodesService: TransferCodesService,
    private readonly transactionTypesService: TransactionTypesService,
    private readonly transferStatusesService: TransferStatusesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    this._maxDepositLimit = this.configService.get('transfer.maxDepositLimit');
    this._lifeSpan = this.configService.get('transfer.lifeSpan');
    this._depositMaxRequestsPerDay = this.configService.get(
      'transfer.depositMaxRequestsPerDay',
    );
    this._minDepositLimit = this.configService.get('transfer.minDepositLimit');
    this._minWithdrawalLimit = this.configService.get(
      'transfer.minWithdrawalLimit',
    );
    this._codeLength = this.configService.getOrThrow('transfer.codeLength');
  }

  /**
   * Get the amount of deposit transfers pending or processing
   * @param userId user id
   * @returns amount
   */

  async getPendingDepositTransfersAmount({
    userId,
    manager,
  }: {
    userId: string;
    manager: EntityManager;
  }) {
    const result: { incomeSum: string }[] = await manager.query(
      `
      SELECT SUM(transfer.amount) as "incomeSum"
        FROM transfer
      LEFT JOIN "transferType" as "type"
        ON transfer."typeId" = "type".id
      LEFT JOIN "transferStatus" as status
        ON transfer."statusId" = status.id
      WHERE transfer."userId" = $1
        AND "type".name = $2
        AND (
          status.name = $3
          OR status.name = $4
        )
      `,
      [
        userId,
        TransferTypeEnum.deposit,
        TransferStatusEnum.pending,
        TransferStatusEnum.processed,
      ],
    );
    const income = result[0]?.incomeSum
      ? 0
      : parseInt(result[0]?.incomeSum, 10);
    return income;
  }

  /**
   * Create deposit transfer
   * @param data data to create deposit transfer
   * @returns created deposit transfer
   */

  async createDeposit(data: ICreateTransfer) {
    const { fixedCurrencyRateId, amount, ...other } = data;
    const { userId } = other;

    const { rate, networkId } =
      await this.fixedCurrencyRatesService.findOneOrFail({
        where: { id: fixedCurrencyRateId },
      });

    let createdTransferId: string;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      await this._validateDepositTransfer({
        userId,
        amount,
        manager: queryRunner.manager,
      });

      const createdAt = new Date();

      const insertResult = await queryRunner.manager.insert(Transfer, {
        ...other,
        amount,
        networkId,
        currencyAmount: Number(
          (convertCentsToDollars(amount) / rate).toFixed(
            MAX_DECIMAL_PLACES_CURRENCY,
          ),
        ),
        createdAt,
        endedAt: moment(createdAt).add(this._lifeSpan, 'hours').toDate(),
        duplicateStatusId: other.statusId,
      });

      createdTransferId = insertResult.identifiers[0].id;

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.transferDepositCreationError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      if (error.status >= 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    } finally {
      await queryRunner.release();
    }

    return await this.findOne({
      id: createdTransferId,
    });
  }

  /**
   * Validate deposit transfer
   * @param data data to validate deposit transfer
   * @throws BadRequestException
   */

  private async _validateDepositTransfer({
    userId,
    amount,
    manager,
  }: {
    userId: string;
    amount: number;
    manager: EntityManager;
  }) {
    const numberDepositTransfersToday = await this._countDepositTransfersToday({
      userId,
      manager,
    });
    if (this._depositMaxRequestsPerDay <= numberDepositTransfersToday) {
      throw new BadRequestException(errorMsgs.depositMaxRequestsPerDay);
    }

    if (amount < this._minDepositLimit) {
      throw new BadRequestException(
        `${errorMsgs.minDepositLimitError} ${convertCentsToDollars(
          this._minDepositLimit,
        )}`,
      );
    }

    const pendingDepositTransfers = await this.getPendingDepositTransfersAmount(
      {
        userId,
        manager,
      },
    );
    const balance = await this.accountStatementsService.getBalanceTransactional(
      {
        userId,
        manager,
      },
    );
    const investment = await manager.findOne(Investment, {
      where: {
        userId,
        completedAt: IsNull(),
        canceledAt: IsNull(),
      },
    });
    const investmentAmount = investment ? investment.amount : 0;

    if (
      amount + pendingDepositTransfers + balance + investmentAmount >=
      this._maxDepositLimit
    ) {
      throw new BadRequestException(
        `${errorMsgs.balanceLimitExceeding} ${convertCentsToDollars(
          this._maxDepositLimit,
        )}`,
      );
    }
  }

  /**
   * Count number deposit transfers today
   * @param userId
   * @returns
   */

  private async _countDepositTransfersToday({
    userId,
    manager,
  }: {
    userId: string;
    manager: EntityManager;
  }) {
    return await manager
      .getRepository(Transfer)
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.type', 'type')
      .where('transfer.userId = :userId', { userId })
      .andWhere('type.name = :typeName', {
        typeName: TransferTypeEnum.deposit,
      })
      .andWhere('transfer.createdAt >= :startOfToday', {
        startOfToday: moment().startOf('day').toDate(),
      })
      .getCount();
  }

  /**
   * Send a confirmation code to create a withdrawal transfer
   * @param data data to send a confirmation code
   * @returns result
   */

  async sendWithdrawalCode(data: ISendWithdrawalCode) {
    const { fixedCurrencyRateId, amount, userId, withdrawalAddress } = data;

    const { email } = await this.usersService.findOneOrFail({ id: userId });
    const { rate, network } =
      await this.fixedCurrencyRatesService.findOneOrFail({
        where: { id: fixedCurrencyRateId },
        relations: { network: { currency: true } },
      });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      await this._validateWithdrawalTransfer({
        amount,
        userId,
        manager: queryRunner.manager,
      });

      const code = generateCode(this._codeLength);
      await queryRunner.manager.insert(TransferCode, {
        userId,
        code,
      });
      await this.mailService.transferCode({
        email,
        code,
        withdrawalAmount: Number(
          (convertCentsToDollars(amount) / rate).toFixed(
            MAX_DECIMAL_PLACES_CURRENCY,
          ),
        ),
        currencyName: network.currency.displayName,
        withdrawalAddress,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.transferWithdrawalSendCodeError}
      Message: ${error.message}
      Stack: ${error.stack}`);
      if (error.status >= 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    } finally {
      await queryRunner.release();
    }

    return { result: true };
  }

  /**
   * Creates withdrawal transfer
   * @param data data to create withdrawal transfer
   * @returns created withdrawal transfer
   */

  async createWithdrawal(data: ICreateWithdrawalTransfer) {
    const { fixedCurrencyRateId, amount, code, ...other } = data;
    const { userId } = other;

    const { networkId, rate } =
      await this.fixedCurrencyRatesService.findOneOrFail({
        where: { id: fixedCurrencyRateId },
      });

    let createdTransferId: string;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      await this.transferCodesService.validate({
        userId,
        code,
        manager: queryRunner.manager,
      });
      await this._validateWithdrawalTransfer({
        amount,
        userId,
        manager: queryRunner.manager,
      });

      const insertResult = await queryRunner.manager.insert(Transfer, {
        ...other,
        amount,
        networkId,
        currencyAmount: Number(
          (convertCentsToDollars(amount) / rate).toFixed(
            MAX_DECIMAL_PLACES_CURRENCY,
          ),
        ),
      });
      createdTransferId = insertResult.identifiers[0].id;

      await queryRunner.manager.update(
        TransferCode,
        {
          userId,
          code,
        },
        {
          transferId: createdTransferId,
        },
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.transferWithdrawalCreationError}
      Message: ${error.message}
      Stack: ${error.stack}`);
      if (error.status >= 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    } finally {
      await queryRunner.release();
    }

    const transfer = await this.findOne({
      id: createdTransferId,
    });

    this.eventEmitter.emit(
      EventEnum.withdrawalTransferCreated,
      new WithdrawalTransferCreatedEvent({
        id: createdTransferId,
        amount,
        createdAt: transfer.createdAt,
        userId,
      }),
    );

    return transfer;
  }

  /**
   * Validate withdrawal transfer
   * @param data data to validate withdrawal transfer
   * @throws BadRequestException
   */

  private async _validateWithdrawalTransfer({
    amount,
    userId,
    manager,
  }: {
    amount: number;
    userId: string;
    manager: EntityManager;
  }) {
    if (amount < this._minWithdrawalLimit) {
      throw new BadRequestException(
        `${errorMsgs.minWithdrawalLimitError} ${convertCentsToDollars(
          this._minWithdrawalLimit,
        )}`,
      );
    }

    const balance = await this.accountStatementsService.getBalanceTransactional(
      { userId, manager },
    );

    if (balance < amount) {
      throw new BadRequestException(errorMsgs.insufficientBalance);
    }
  }

  /**
   * Update Transfer txId
   * @param data data to update txId
   * @returns void
   */

  async updateTxId(userId: string, { transferId: id, txId }: UpdateTxIdDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    const { manager } = queryRunner;

    const updatedAt = new Date();
    const data: QueryDeepPartialEntity<Transfer> = { txId, updatedAt };

    try {
      const transfer = await this.findOneOrFail(manager, {
        where: { id },
        relations: { status: true, type: true },
      });
      if (
        transfer.userId !== userId ||
        transfer.status.name !== TransferStatusEnum.pending ||
        moment().isAfter(transfer.endedAt) ||
        transfer.txId
      ) {
        throw new ForbiddenException(errorMsgs.transferUpdateForbidden);
      }

      // if (transfer.type.name === TransferTypeEnum.deposit) {
      //   const statusCanceled = await this.transferStatusesService.findOneOrFail(
      //     {
      //       name: TransferStatusEnum.canceled,
      //     },
      //   );
      //   const transferWithSameTxId = await manager.findOne(Transfer, {
      //     where: { txId, statusId: Not(statusCanceled.id) },
      //   });
      //   if (transferWithSameTxId) {
      //     data.statusId = statusCanceled.id;
      //     data.note = transferNotes.txIdAlreadyBeenUsed;
      //     data.completedAt = updatedAt;
      //   }
      // }

      await manager.update(Transfer, { id }, data);
      await manager.insert(TransferInfo, { transferId: id });

      if (!data.completedAt) {
        this.eventEmitter.emit(
          EventEnum.txIdAdded,
          new TxIdAddedEvent({
            id,
            txId,
            updatedAt,
            transferTypeName: transfer.type.name,
            userId: transfer.userId,
            amount: transfer.amount,
          }),
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.txIdUpdateError}
      Message: ${error.message}
      Stack: ${error.stack}`);
      if (error.status >= 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    } finally {
      await queryRunner.release();
    }

    return await this.findOne({ id });
  }

  /**
   * Change transfer status to processed
   * @param id transfer id
   * @returns transfer
   */

  async process({ transferId: id, txId, userId }: IProcessTransfer) {
    const transfer = await this.findOne({ id });
    if (!transfer) {
      throw new NotFoundException(errorMsgs.transferNotFound);
    }
    if (transfer.status.name !== TransferStatusEnum.pending) {
      throw new BadRequestException(errorMsgs.transferMustBePending);
    }
    if (transfer.completedAt) {
      throw new BadRequestException(errorMsgs.transferCompleted);
    }
    if (
      (transfer.type.name === TransferTypeEnum.withdrawal && !txId) ||
      (transfer.type.name === TransferTypeEnum.deposit && !transfer.txId)
    ) {
      throw new BadRequestException(errorMsgs.txIdRequired);
    }
    const statusProcessed = await this.transferStatusesService.findOneOrFail({
      name: TransferStatusEnum.processed,
    });
    await this.repository.update(
      { id },
      { txId, statusId: statusProcessed.id, updatedAt: new Date() },
    );

    this.eventEmitter.emit(
      EventEnum.transferProcessed,
      new TransferProcessedEvent({
        adminId: userId,
        amount: transfer.amount,
        transferId: transfer.id,
        txId: txId ?? transfer.txId,
        type: transfer.type.name,
      }),
    );

    return await this.findOne({ id });
  }

  /**
   * Validation of deposit confirmation
   * @param data data to validate
   * @returns void
   * @throw Error
   */

  private async _validateConfirmDeposit({
    txId,
    typeName,
    transaction,
    completedAt,
  }: IValidateConfirmDeposit) {
    if (typeName !== TransferTypeEnum.deposit) {
      throw new BadRequestException(errorMsgs.transferMustBeDeposit);
    }
    if (!txId) {
      throw new BadRequestException(errorMsgs.txIdRequired);
    }
    if (completedAt || transaction) {
      throw new ForbiddenException(errorMsgs.transferAlreadyCompleted);
    }
  }

  /**
   * Confirm deposit transfer
   * @param id transfer id
   * @param adminId admin id
   */

  async confirmDeposit(id: string, adminId: string) {
    const transactionTypeDeposit =
      await this.transactionTypesService.findOneOrFail({
        name: TransactionTypeEnum.deposit,
      });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { txId, type, transaction, completedAt, userId, amount } =
        await this.findOneOrFail(queryRunner.manager, {
          where: { id },
          relations: {
            type: true,
            transaction: true,
          },
        });
      await this._validateConfirmDeposit({
        txId,
        typeName: type.name,
        transaction,
        completedAt,
      });

      // await this.completeTransferCreateTransaction({
      //   manager: queryRunner.manager,
      //   id,
      //   userId,
      //   amount,
      //   typeId: transactionTypeDeposit.id,
      //   txId,
      //   adminId,
      // });
      // TODO

      const statusCompleted = await this.transferStatusesService.findOneOrFail({
        name: TransferStatusEnum.completed,
      });

      await this.update({
        manager: queryRunner.manager,
        findOptions: { id },
        partialEntity: {
          statusId: statusCompleted.id,
          completedAt: new Date(),
        },
      });
      const createdTransaction = queryRunner.manager.create(Transaction, {
        userId,
        amount,
        typeId: transactionTypeDeposit.id,
        transferId: id,
      });
      this.eventEmitter.emit(
        EventEnum.depositTransferCompleted,
        new DepositTransferCompletedEvent({
          amount,
          txId,
          userId,
          adminId,
          transferId: id,
        }),
      );
      await queryRunner.manager.save(Transaction, createdTransaction);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.depositConfirmationError}
          Message: ${error.message}
          Stack: ${error.stack}`);
      if (error.status >= 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    } finally {
      await queryRunner.release();
    }

    return await this.findOne({ id });
  }

  /**
   * Complete transfer and create related transaction
   * @param data complete transfer and create transaction
   * @returns void
   */

  public async completeTransferCreateTransaction({
    manager,
    id,
    userId,
    amount,
    typeId,
    txId,
    adminId,
  }: ICompleteTransferCreateTransaction) {
    const statusCompleted = await this.transferStatusesService.findOneOrFail({
      name: TransferStatusEnum.completed,
    });

    // await this.update({
    //   manager,
    //   findOptions: { id },
    //   partialEntity: { statusId: statusCompleted.id, completedAt: new Date() },
    // });
    // const createdTransaction = manager.create(Transaction, {
    //   userId,
    //   amount,
    //   typeId,
    //   transferId: id,
    // });
    // await manager.save(Transaction, createdTransaction);

    await manager.update(
      Transfer,
      { id },
      { duplicateStatusId: statusCompleted.id },
    );

    this.eventEmitter.emit(
      EventEnum.depositTransferCompleted,
      new DepositTransferCompletedEvent({
        amount,
        txId,
        userId,
        adminId,
        transferId: id,
      }),
    );
  }

  /**
   * Cancel deposit transfer
   * @param id transfer id
   */

  async cancelDeposit({ transferId: id, userId, note }: ITransferCancel) {
    const transfer = await this.findOne({ id });
    if (!transfer) {
      throw new NotFoundException(errorMsgs.transferNotFound);
    }
    if (transfer.transaction) {
      const accountStatement = await this.accountStatementsService.findOne({
        where: {
          userId: transfer.userId,
          createdAt: MoreThan(transfer.transaction.createdAt),
        },
      });
      if (accountStatement) {
        throw new BadRequestException(errorMsgs.transferHasClosedTransaction);
      }
    }

    if (transfer.completedAt && !moment().isSame(transfer.completedAt, 'day')) {
      const isSuperAdmin = await this.usersService.checkAccessSuperAdmin(
        userId,
      );
      if (!isSuperAdmin) {
        throw new ForbiddenException(errorMsgs.transferNextDayCancellation);
      }
    }
    // if (
    //   !moment().isSame(transfer.transaction?.createdAt, 'day') &&
    //   !isSuperAdmin
    // ) {
    //   throw new ForbiddenException(errorMsgs.transferNextDayCancellation);
    // }

    const statusCanceled = await this.transferStatusesService.findOneOrFail({
      name: TransferStatusEnum.canceled,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.update({
        manager: queryRunner.manager,
        findOptions: { id },
        partialEntity: {
          statusId: statusCanceled.id,
          completedAt: new Date(),
          note,
        },
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.depositCancelationError}
          Message: ${error.message}
          Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.depositCancelationError);
    } finally {
      await queryRunner.release();
    }

    return await this.findOne({ id });
  }

  /**
   * Validation of withdrawal confirmation
   * @param data data to validate
   * @returns void
   * @throws Error
   */

  private async _validateConfirmWithdrawal({
    txId,
    typeName,
    transaction,
    completedAt,
  }: IValidateConfirmWithdrawal) {
    if (!txId) {
      throw new NotFoundException(errorMsgs.transferHasNoTxId);
    }
    if (typeName !== TransferTypeEnum.withdrawal) {
      throw new BadRequestException(errorMsgs.transferMustBeWithdrawal);
    }
    if (transaction || completedAt) {
      throw new ForbiddenException(errorMsgs.transferAlreadyCompleted);
      // const accountStatement = await this.accountStatementsService.findOne({
      //   where: {
      //     userId: transfer.userId,
      //     createdAt: MoreThan(transfer.transaction.createdAt),
      //   },
      // });
      // if (accountStatement) {
      //   throw new BadRequestException(errorMsgs.transferHasClosedTransaction);
      // }
    }
    // if (transfer.completedAt && !moment().isSame(transfer.completedAt, 'day')) {
    //   const isSuperAdmin = await this.usersService.checkAccessSuperAdmin(
    //     adminId,
    //   );
    //   if (!isSuperAdmin) {
    //     throw new ForbiddenException(errorMsgs.transferNextDayCancellation);
    //   }
    // }
  }

  /**
   * Confirm deposit transfer
   * @param id transfer id
   * @param adminId admin user id
   */

  async confirmWithdrawal(id: string, adminId: string) {
    const statusCompleted = await this.transferStatusesService.findOneOrFail({
      name: TransferStatusEnum.completed,
    });
    const transactionWithdrawalType =
      await this.transactionTypesService.findOneOrFail({
        name: TransactionTypeEnum.withdrawal,
      });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const { userId, amount, txId, type, completedAt, transaction } =
        await this.findOneOrFail(queryRunner.manager, {
          where: { id },
          relations: {
            type: true,
            transaction: true,
          },
        });
      await this._validateConfirmWithdrawal({
        txId,
        typeName: type.name,
        transaction,
        completedAt,
      });
      await queryRunner.manager.update(
        Transfer,
        { id },
        { statusId: statusCompleted.id, completedAt: new Date() },
      );
      const createdTransaction = queryRunner.manager.create(Transaction, {
        userId,
        amount,
        typeId: transactionWithdrawalType.id,
        transferId: id,
      });
      await queryRunner.manager.save(Transaction, createdTransaction);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.transferWithdrawalConfirmationError}
          Message: ${error.message}
          Stack: ${error.stack}`);
      if (error.status >= 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    } finally {
      await queryRunner.release();
    }

    const completedTransfer = await this.findOne({ id });

    this.eventEmitter.emit(
      EventEnum.withdrawalTransferCompleted,
      new WithdrawalTransferCompletedEvent({
        amount: completedTransfer.amount,
        txId: completedTransfer.txId,
        userId: completedTransfer.userId,
        adminId,
        transferId: id,
      }),
    );

    return completedTransfer;
  }

  /**
   * Cancel withdrawal transfer
   * @param id transfer id
   * @param userId user id
   */

  async cancelWithdrawal({ transferId: id, userId, note }: ITransferCancel) {
    const transfer = await this.findOne({ id });
    if (!transfer) {
      throw new NotFoundException(errorMsgs.transferNotFound);
    }
    if (transfer.transaction) {
      const accountStatement = await this.accountStatementsService.findOne({
        where: {
          userId: transfer.userId,
          createdAt: MoreThan(transfer.transaction.createdAt),
        },
      });
      if (accountStatement) {
        throw new BadRequestException(errorMsgs.transferHasClosedTransaction);
      }
    }
    if (transfer.completedAt && !moment().isSame(transfer.completedAt, 'day')) {
      const isSuperAdmin = await this.usersService.checkAccessSuperAdmin(
        userId,
      );
      if (!isSuperAdmin) {
        throw new ForbiddenException(errorMsgs.transferNextDayCancellation);
      }
    }

    const statusCanceled = await this.transferStatusesService.findOneOrFail({
      name: TransferStatusEnum.canceled,
    });
    await this.repository.update(
      { id },
      {
        statusId: statusCanceled.id,
        updatedAt: new Date(),
        completedAt: new Date(),
        note,
      },
    );
    return await this.findOne({ id });
  }

  /**
   * Returns Transfer by find options
   * @param findOptions find options
   * @returns Transfer or undefined
   */

  async findOne(
    findOptions: FindOptionsWhere<Transfer> | FindOptionsWhere<Transfer>[],
  ) {
    return await this.repository.findOne({
      where: findOptions,
      relations: {
        status: true,
        type: true,
        transaction: true,
        network: { currency: true },
      },
    });
  }

  /**
   * Returns Transfer or fail
   * @param findOptions find options
   * @returns Transfer
   * @throws NotFoundException if Transfer not found
   */

  async findOneOrFail(
    manager: EntityManager,
    findOptions: FindOneOptions<Transfer>,
  ) {
    const transfer = await manager.findOne(Transfer, findOptions);
    if (!transfer) {
      throw new NotFoundException(errorMsgs.transferNotFound);
    }
    return transfer;
  }

  /**
   * Calculate transfer amount
   * @param data data to calculate transfer amount
   * @returns amount and currency amount
   */

  async calculateAmount(data: ITransferCalculateAmount) {
    const {
      fixedCurrencyRateId,
      amount: receivedAmount,
      currencyAmount: receivedCurrencyAmount,
      // userId,
      // transferType,
    } = data;
    const { rate } = await this.fixedCurrencyRatesService.findOneOrFail({
      where: { id: fixedCurrencyRateId },
    });

    const result = {
      amount: receivedAmount ? receivedAmount : 0,
      currencyAmount: receivedCurrencyAmount ? receivedCurrencyAmount : 0,
      errors: [] as string[],
    };

    if (receivedAmount) {
      result.amount = receivedAmount;
      result.currencyAmount = Number(
        (receivedAmount / rate).toFixed(MAX_DECIMAL_PLACES_CURRENCY),
      );
    } else if (receivedCurrencyAmount) {
      result.amount = Number(
        (receivedCurrencyAmount * rate).toFixed(MAX_DECIMAL_PLACES),
      );
      result.currencyAmount = receivedCurrencyAmount;
    }

    // if (transferType === TransferTypeEnum.deposit) {
    //   result.errors = await this._validateDepositTransfer({
    //     amount: result.amount,
    //     userId,
    //     manager: '',
    //   });
    // } else {
    //   result.errors = await this._validateWithdrawalTransfer({
    //     amount: result.amount,
    //     userId,
    //     manager: '',
    //   });
    // }

    return result;
  }

  /**
   * Returns transfer by id and user id
   * @param data data to get transfer
   * @returns transfer
   * @throws NotFoundException
   */

  async findOnePublic({ id, userId, localeId }: IFindTransfer) {
    const transfer = await this.findOneWithLocale({ id, localeId });
    if (!transfer) {
      throw new NotFoundException(errorMsgs.transferNotFound);
    }
    if (userId !== transfer.userId) {
      const isAdmin = await this.usersService.checkAccess(userId);
      if (!isAdmin) {
        throw new NotFoundException(errorMsgs.transferNotFound);
      }
    }
    return transfer;
  }

  /**
   * Return transfers by find options
   * @param findOptions find options
   * @returns array entities with pagination options
   */

  async find(findOptions: IGetTransfers) {
    return await qbFindTransfers(this.repository, findOptions);
  }

  /**
   * Return transfer with locale content
   * @param data find options
   * @returns transfer or undefined
   */

  async findOneWithLocale({ id, localeId }: { id: string; localeId: string }) {
    const query = this.repository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.status', 'status')
      .leftJoinAndSelect('transfer.network', 'network')
      .leftJoinAndSelect('network.currency', 'currency')
      .leftJoinAndSelect('transfer.type', 'type')
      .where('transfer.id = :id', { id });

    if (localeId) {
      query
        .leftJoinAndSelect(
          'type.localeContent',
          'typeLocaleContent',
          'typeLocaleContent.localeId = :localeId',
          { localeId },
        )
        .leftJoinAndSelect(
          'status.localeContent',
          'statusLocaleContent',
          'statusLocaleContent.localeId = :localeId',
          { localeId },
        );
    } else {
      query
        .leftJoinAndSelect('type.localeContent', 'typeLocaleContent')
        .leftJoinAndSelect('status.localeContent', 'statusLocaleContent');
    }

    return await query.getOne();
  }

  /**
   * Get the amount of not completed withdrawal transfers. Transactional
   * @param data data to get the amount of transfers
   * @returns transfers sum
   */

  public async getNotCompletedWithdrawalTransfersSum({
    userId,
    manager,
  }: {
    userId: string;
    manager: EntityManager;
  }) {
    const query = manager
      .getRepository(Transfer)
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.type', 'transferType')
      .leftJoinAndSelect('transfer.status', 'transferStatus')
      .select('SUM(transfer.amount)', 'stringSum')
      .where('transfer.userId = :userId', { userId })
      .andWhere('transferType.name = :transferTypeName', {
        transferTypeName: TransferTypeEnum.withdrawal,
      })
      .andWhere('transferStatus.name IN (:...transferStatusNames)', {
        transferStatusNames: [
          TransferStatusEnum.pending,
          TransferStatusEnum.processed,
        ],
      });

    const { stringSum }: { stringSum: string } = await query.getRawOne();
    return !stringSum ? 0 : parseInt(stringSum, 10);
  }

  /**
   * Update within a transaction with update date
   * @param data data to update
   * @returns update result
   */

  public async update({
    findOptions,
    partialEntity,
    manager,
  }: {
    manager: EntityManager;
    findOptions: FindOptionsWhere<Transfer>;
    partialEntity: QueryDeepPartialEntity<Transfer>;
  }) {
    return await manager.update(Transfer, findOptions, {
      ...partialEntity,
      updatedAt: new Date(),
    });
  }

  /**
   * Update with update date
   * @param data data to update
   * @returns update result
   */

  public async systemUpdate({
    findOptions,
    partialEntity,
  }: {
    findOptions: FindOptionsWhere<Transfer>;
    partialEntity: QueryDeepPartialEntity<Transfer>;
  }) {
    return await this.repository.update(findOptions, {
      ...partialEntity,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates the transfer to canceled status
   * @param data data to cancel transfer
   * @returns void
   */

  public async cancel({
    manager,
    id,
    note,
    amount,
    txId,
    adminId,
  }: {
    manager: EntityManager;
    id: string;
    note: string;
    txId: string;
    amount: number;
    adminId?: string;
  }) {
    const transferStatusCanceled =
      await this.transferStatusesService.findOneOrFail({
        name: TransferStatusEnum.canceled,
      });
    // TODO
    // await this.update({
    //   manager,
    //   findOptions: { id },
    //   partialEntity: {
    //     statusId: transferStatusCanceled.id,
    //     note,
    //   },
    // });
    await this.update({
      manager,
      findOptions: { id },
      partialEntity: {
        duplicateStatusId: transferStatusCanceled.id,
      },
    });
    this.eventEmitter.emit(
      EventEnum.depositTransferCanceled,
      new DepositTransferCanceledEvent({
        txId,
        amount,
        transferId: id,
        note,
        adminId,
      }),
    );
  }
}
