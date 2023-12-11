import * as moment from 'moment';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { TransactionTypeEnum } from '../transaction-types/transaction-type.enum';
import { Transaction } from './entities/transaction.entity';
import { TransferTypeEnum } from '../transfers/transfer-types.enum';
import { TransferStatusEnum } from '../transfer-statuses/transfer-status.enum';
import { ConfigService } from '@nestjs/config';
import { IGetTransfersSum } from '../../types/transactions/get-transfers-sum.interface';
import { IGetTotalIncome } from '../../types/transactions/get-total-income-transactional.interface';
import { IGetRewardsSum } from '../../types/transactions/get-rewards-sum.interface';
import { IGetTotalConsumption } from '../../types/transactions/get-total-consumption.interface';
import { IGetFinesAmount } from '../../types/transactions/get-fines-amount.interface';
import { IFindRewards } from '../../types/transactions/find-rewards.interface';
import { SortOrder } from '../../utils/sort-order.enum';
import { IFindTransactions } from '../../types/transactions/find-transactions.interface';
import { TransfersService } from '../transfers/transfers.service';
import { ISendInternalTransactionCode } from '../../types/transactions/send-internal-transfer-code.interface';
import { errorMsgs } from '../../shared/error-messages';
import { UsersService } from '../users/users.service';
import { AccountStatementsService } from '../account-statements/account-statements.service';
import { generateCode } from '../../utils/generate-code';
import { TransactionCode } from '../transactions-codes/entities/transaction-code.entity';
import { convertCentsToDollars } from '../../utils/convert-cents-to-dollars';
import { MailService } from '../mail/mail.service';
import { ICreateInternalTransaction } from '../../types/transactions/create-internal-transaction.interface';
import { TransactionCodesService } from '../transactions-codes/transaction-codes.service';
import { TransactionTypesService } from '../transaction-types/transaction-types.service';
import { IGetTransactionsAmount } from '../../types/transactions/get-transactions-amount.interface';
import { DEPOSIT_TRANSACTION_TYPES } from '../../utils/constants/common-constants';
import { investmentIncomeTelegramMessage } from '../telegram-bot/templates/investment-income';
import { InvestmentsTransactionsService } from '../investments-transactions/investments-transactions.service';
import { referralRewardTelegramMessage } from '../telegram-bot/templates/referral-reward';
import { InvestmentsService } from '../investments/investments.service';
import { receiptFundsTelegramMessage } from '../telegram-bot/templates/receipt-funds';
import { IDetermineDataSendingTelegramReceiptFunds } from './determine-data-sending-telegram-receipt-funds.interface';
import { InjectQueue } from '@nestjs/bull';
import { TelegramQueueNameEnum } from '../telegram-bot/telegram-queue-name.enum';
import { Queue } from 'bull';
import { ITelegramSendMessage } from '../../types/telegram-bot/telegram-send-message.interface';

@Injectable()
export class TransactionsService {
  private _codeLength: number;
  private _minInternalTransactionLimit: number;
  private _maxInternalTransactionLimit: number;
  constructor(
    @Inject(forwardRef(() => AccountStatementsService))
    private readonly accountStatementsService: AccountStatementsService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => InvestmentsService))
    private readonly investmentsService: InvestmentsService,
    private readonly investmentsTransactionsService: InvestmentsTransactionsService,
    private readonly logger: Logger,
    private readonly mailService: MailService,
    @InjectRepository(Transaction)
    private repository: Repository<Transaction>,
    @InjectQueue(TelegramQueueNameEnum.sendMessage)
    private telegramQueue: Queue<ITelegramSendMessage>,
    private readonly transactionCodesService: TransactionCodesService,
    private readonly transactionTypesService: TransactionTypesService,
    private readonly transfersService: TransfersService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    this._codeLength = this.configService.getOrThrow('transaction.codeLength');
    this._minInternalTransactionLimit = this.configService.get(
      'transaction.minInternalTransactionLimit',
    );
    this._maxInternalTransactionLimit = this.configService.get(
      'transaction.maxInternalTransactionLimit',
    );
  }

  /**
   * Executed after a transaction is committed when a funds transaction is created
   * @param transaction created transaction
   * @returns void
   */

  public async afterTransactionCommitInsert(transaction: Transaction) {
    try {
      const {
        amount,
        typeId,
        userId,
        createdAt,
        investmentTransactionId,
        investmentId,
        referralLevelPercentage,
      } = transaction;
      const { name } = await this.transactionTypesService.findOneOrFail({
        id: typeId,
      });
      if (DEPOSIT_TRANSACTION_TYPES.includes(name)) {
        const { telegramChatId } = await this.usersService.findOne({
          id: userId,
        });
        if (telegramChatId) {
          const data = await this.determineDataSendingTelegramReceiptFunds({
            telegramChatId,
            transactionTypeName: name,
            userId,
            investmentTransactionId,
            amount,
            investmentId,
            referralLevelPercentage,
            createdAt,
          });
          await this.telegramQueue.add(data);
        }
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.transactionAfterCommitInsert}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  /**
   * Determine the data for sending telegram message about the receipt of funds
   * @param data data to determine the data to send
   * @returns telegram message data
   */

  public async determineDataSendingTelegramReceiptFunds({
    telegramChatId,
    transactionTypeName,
    userId,
    investmentTransactionId,
    amount,
    investmentId,
    referralLevelPercentage,
    createdAt,
  }: IDetermineDataSendingTelegramReceiptFunds) {
    const data = {
      chat_id: telegramChatId,
      text: '',
    };
    if (
      transactionTypeName === TransactionTypeEnum.income ||
      transactionTypeName === TransactionTypeEnum.reward
    ) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const { manager } = queryRunner;
      const balance =
        await this.accountStatementsService.getBalanceTransactional({
          userId,
          manager,
        });
      await queryRunner.commitTransaction();
      await queryRunner.release();
      if (transactionTypeName === TransactionTypeEnum.income) {
        const { investment } =
          await this.investmentsTransactionsService.findOne({
            where: { id: investmentTransactionId },
            relations: { investment: true },
          });

        data.text = investmentIncomeTelegramMessage({
          dailyIncome: amount,
          investmentStartDate: investment.startDate,
          investmentDueDate: investment.dueDate,
          totalBalance: investment.amount + balance,
          amountWithdrawalAvailable: balance,
        });
      } else {
        const depositType = await this.transactionTypesService.findOneOrFail({
          name: TransactionTypeEnum.deposit,
        });
        const investmentTransaction =
          await this.investmentsTransactionsService.findOne({
            where: { investmentId, typeId: depositType.id },
            order: { createdAt: SortOrder.DESC },
          });

        const investment = await this.investmentsService.findOne({
          where: { userId, completedAt: IsNull(), canceledAt: IsNull() },
        });
        data.text = referralRewardTelegramMessage({
          investmentAmount: investmentTransaction.amount,
          referralRewardPercentage: referralLevelPercentage,
          referralRewardAmount: amount,
          totalBalance: balance + (investment?.amount || 0),
          amountWithdrawalAvailable: balance,
        });
      }
    } else {
      data.text = receiptFundsTelegramMessage({ amount, createdAt });
    }
    return data;
  }

  /**
   * Get the amount of completed transfers from the beginning of the month. Transactional
   * @param data data to get the amount of transfers
   * @returns transfers sum
   */

  async getCompletedTransfersSum({
    userId,
    afterDate,
    beforeDate,
    transactionTypeName,
    transferTypeName,
    manager,
  }: IGetTransfersSum) {
    const query = manager
      .getRepository(Transaction)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.type', 'transactionType')
      .leftJoinAndSelect('transaction.transfer', 'transfer')
      .leftJoinAndSelect('transfer.type', 'transferType')
      .leftJoinAndSelect('transfer.status', 'transferStatus')
      .select('SUM(transaction.amount)', 'stringSum')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transactionType.name = :transactionTypeName', {
        transactionTypeName,
      })
      .andWhere('transferType.name = :transferTypeName', {
        transferTypeName,
      })
      .andWhere('transferStatus.name = :transferStatusName', {
        transferStatusName: TransferStatusEnum.completed,
      });

    if (afterDate) {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate,
      });
    } else {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate: moment().startOf('month').toDate(),
      });
    }

    if (beforeDate) {
      query.andWhere('transaction.createdAt <= :beforeDate', {
        beforeDate,
      });
    }

    const { stringSum }: { stringSum: string } = await query.getRawOne();
    return !stringSum ? 0 : parseInt(stringSum, 10);
  }

  /**
   * Get the amount of rewards from the beginning of the month. Transactional
   * @param data data to get the amount of rewards
   * @returns rewards sum
   */

  async getRewardsSum({
    userId,
    afterDate,
    beforeDate,
    manager,
  }: IGetRewardsSum) {
    const query = manager
      .getRepository(Transaction)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.type', 'transactionType')
      .select('SUM(transaction.amount)', 'stringSum')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transactionType.name = :transactionTypeName', {
        transactionTypeName: TransactionTypeEnum.reward,
      });

    if (afterDate) {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate,
      });
    } else {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate: moment().startOf('month').toDate(),
      });
    }

    if (beforeDate) {
      query.andWhere('transaction.createdAt <= :beforeDate', {
        beforeDate,
      });
    }

    const { stringSum }: { stringSum: string } = await query.getRawOne();
    return !stringSum ? 0 : parseInt(stringSum, 10);
  }

  /**
   * Get the amount received from investments since the beginning of the month. Transactional
   * @param data data to get the amount
   * @returns amount
   */

  async getAmountReceivedFromInvestments({
    userId,
    afterDate,
    beforeDate,
    manager,
  }: IGetRewardsSum) {
    const query = manager
      .getRepository(Transaction)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.type', 'transactionType')
      .leftJoinAndSelect(
        'transaction.investmentTransaction',
        'investmentTransaction',
      )
      .leftJoinAndSelect(
        'investmentTransaction.type',
        'investmentTransactionType',
      )
      .select('SUM(transaction.amount)', 'stringSum')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transactionType.name IN (:...transactionTypeNames)', {
        transactionTypeNames: [
          TransactionTypeEnum.deposit,
          TransactionTypeEnum.income,
        ],
      })
      .andWhere('transaction.investmentTransactionId IS NOT NULL')
      .andWhere(
        'investmentTransactionType.name = :investmentTransactionTypeName',
        {
          investmentTransactionTypeName: TransactionTypeEnum.withdrawal,
        },
      );

    if (afterDate) {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate,
      });
    } else {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate: moment().startOf('month').toDate(),
      });
    }

    if (beforeDate) {
      query.andWhere('transaction.createdAt <= :beforeDate', {
        beforeDate,
      });
    }

    const { stringSum }: { stringSum: string } = await query.getRawOne();
    return !stringSum ? 0 : parseInt(stringSum, 10);
  }

  /**
   * Get the amount of investments from the beginning of the month. Transactional
   * @param data data to get the amount
   * @returns amount
   */

  async getInvestedAmount({
    userId,
    afterDate,
    beforeDate,
    manager,
  }: IGetRewardsSum) {
    const query = manager
      .getRepository(Transaction)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.type', 'transactionType')
      .leftJoinAndSelect(
        'transaction.investmentTransaction',
        'investmentTransaction',
      )
      .leftJoinAndSelect(
        'investmentTransaction.type',
        'investmentTransactionType',
      )
      .select('SUM(transaction.amount)', 'stringSum')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transactionType.name = :transactionTypeName', {
        transactionTypeName: TransactionTypeEnum.withdrawal,
      })
      .andWhere('transaction.investmentTransactionId IS NOT NULL')
      .andWhere(
        'investmentTransactionType.name = :investmentTransactionTypeName',
        {
          investmentTransactionTypeName: TransactionTypeEnum.deposit,
        },
      );

    if (afterDate) {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate,
      });
    } else {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate: moment().startOf('month').toDate(),
      });
    }

    if (beforeDate) {
      query.andWhere('transaction.createdAt <= :beforeDate', {
        beforeDate,
      });
    }

    const { stringSum }: { stringSum: string } = await query.getRawOne();
    return !stringSum ? 0 : parseInt(stringSum, 10);
  }

  /**
   * Get the amount of fines from the beginning of the month. Transactional
   * @param data data to get the amount
   * @returns amount
   */

  async getFinesAmount({
    userId,
    afterDate,
    beforeDate,
    manager,
  }: IGetFinesAmount) {
    const query = manager
      .getRepository(Transaction)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.type', 'transactionType')
      .leftJoinAndSelect('transaction.investment', 'investment')
      .select('SUM(transaction.amount)', 'stringSum')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transactionType.name = :transactionTypeName', {
        transactionTypeName: TransactionTypeEnum.fine,
      })
      .andWhere('transaction.investmentId IS NOT NULL')
      .andWhere('investment.canceledAt IS NOT NULL');

    if (afterDate) {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate,
      });
    } else {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate: moment().startOf('month').toDate(),
      });
    }

    if (beforeDate) {
      query.andWhere('transaction.createdAt <= :beforeDate', {
        beforeDate,
      });
    }

    const { stringSum }: { stringSum: string } = await query.getRawOne();
    return !stringSum ? 0 : parseInt(stringSum, 10);
  }

  /**
   * Get the total income for the past month. Transactional
   * @param userId user id
   * @returns total income
   */

  async getTotalIncome(data: IGetTotalIncome) {
    const depositTransfersSum = await this.getCompletedTransfersSum({
      ...data,
      transactionTypeName: TransactionTypeEnum.deposit,
      transferTypeName: TransferTypeEnum.deposit,
    });

    const rewardsSum = await this.getRewardsSum(data);

    const amountReceivedFromInvestments =
      await this.getAmountReceivedFromInvestments(data);

    const internalTransfersIncomingAmount = await this.getTransactionsAmount({
      ...data,
      transactionTypeName: TransactionTypeEnum.internalTransferIncoming,
    });

    return (
      depositTransfersSum +
      rewardsSum +
      amountReceivedFromInvestments +
      internalTransfersIncomingAmount
    );
  }

  /**
   * Get the total consumption for the past month. Transactional
   * @param userId user id
   * @returns total income
   */

  async getTotalConsumption(data: IGetTotalConsumption) {
    const { userId, manager, isAccountStatement } = data;

    let withdrawalTransfersSum = 0;
    const completedWithdrawalTransfersSum = await this.getCompletedTransfersSum(
      {
        ...data,
        transactionTypeName: TransactionTypeEnum.withdrawal,
        transferTypeName: TransferTypeEnum.withdrawal,
      },
    );
    withdrawalTransfersSum += completedWithdrawalTransfersSum;

    if (!isAccountStatement) {
      const notCompletedWithdrawalTransfersSum =
        await this.transfersService.getNotCompletedWithdrawalTransfersSum({
          userId,
          manager,
        });
      withdrawalTransfersSum += notCompletedWithdrawalTransfersSum;
    }

    const investedAmount = await this.getInvestedAmount(data);

    const finesAmount = await this.getFinesAmount(data);

    const internalTransfersOutgoingAmount = await this.getTransactionsAmount({
      ...data,
      transactionTypeName: TransactionTypeEnum.internalTransferOutgoing,
    });

    return (
      withdrawalTransfersSum +
      investedAmount +
      finesAmount +
      internalTransfersOutgoingAmount
    );
  }

  /**
   * Find rewards
   * @param findOptions find options
   * @returns array of entities and pagination data
   */

  async findRewards(findOptions: IFindRewards) {
    const { userId, sort, page, limit, afterDate, beforeDate } = findOptions;
    const skip = (page - 1) * limit;
    const query = this.repository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.type', 'transactionType')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transactionType.name = :transactionTypeName', {
        transactionTypeName: TransactionTypeEnum.reward,
      });

    if (afterDate) {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate,
      });
    }

    if (beforeDate) {
      query.andWhere('transaction.createdAt <= :beforeDate', {
        beforeDate,
      });
    }

    if (sort) {
      sort.forEach((sortBy) =>
        query.addOrderBy(
          `transaction.${sortBy[0]}`,
          sortBy[1].toUpperCase() as SortOrder,
        ),
      );
    } else {
      query.orderBy('transaction.createdAt', SortOrder.DESC);
    }

    const [entities, itemCount] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { entities, limit, page, itemCount };
  }

  /**
   * Find transactions
   * @param findOptions find options
   * @returns array of entities and pagination data
   */

  async find(findOptions: IFindTransactions) {
    const {
      userId,
      sort,
      page,
      limit,
      afterDate,
      beforeDate,
      localeId,
      typeId,
    } = findOptions;

    const skip = (page - 1) * limit;
    const query = this.repository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.type', 'transactionType')
      .leftJoinAndSelect(
        'transactionType.localeContent',
        'localeContent',
        'localeContent.localeId = :localeId',
        { localeId },
      )
      .leftJoin('transaction.originTransaction', 'originTransaction')
      .leftJoin('originTransaction.user', 'fromUser')
      .leftJoin('transaction.receiptTransaction', 'receiptTransaction')
      .leftJoin('receiptTransaction.user', 'toUser')
      .select('transaction.id', 'id')
      .addSelect('transaction.userId', 'userId')
      .addSelect('transaction.typeId', 'typeId')
      .addSelect('transaction.amount::float / 100', 'amount')
      .addSelect('transaction.transferId', 'transferId')
      .addSelect('transaction.investmentId', 'investmentId')
      .addSelect(
        'transaction.investmentTransactionId',
        'investmentTransactionId',
      )
      .addSelect('transaction.originTransactionId', 'originTransactionId')
      .addSelect('transaction.createdAt', 'createdAt')
      .addSelect('localeContent.displayName', 'typeDisplayName')
      .addSelect('fromUser.id', 'fromUserId')
      .addSelect('fromUser.firstName', 'fromUserFirstName')
      .addSelect('fromUser.lastName', 'fromUserLastName')
      .addSelect('fromUser.email', 'fromUserEmail')
      .addSelect('toUser.id', 'toUserId')
      .addSelect('toUser.email', 'toUserEmail')
      .addSelect('toUser.firstName', 'toUserFirstName')
      .addSelect('toUser.lastName', 'toUserLastName');
    if (userId) {
      query.where('transaction.userId = :userId', { userId });
    }
    if (typeId) {
      query.andWhere('transaction.typeId = :typeId', { typeId });
    }
    if (afterDate) {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate,
      });
    }

    if (beforeDate) {
      query.andWhere('transaction.createdAt <= :beforeDate', {
        beforeDate,
      });
    }

    if (sort) {
      sort.forEach((sortBy) =>
        query.addOrderBy(
          `transaction.${sortBy[0]}`,
          sortBy[1].toUpperCase() as SortOrder,
        ),
      );
    } else {
      query.orderBy('transaction.createdAt', SortOrder.DESC);
    }

    // const [entities, itemCount] = await query
    //   .skip(skip)
    //   .take(limit)
    //   .getManyAndCount();
    const entities = await query.offset(skip).limit(limit).getRawMany();
    const itemCount = await query.getCount();
    return { entities, limit, page, itemCount };
  }

  /**
   * Validate internal transfer
   * @param data data to validate internal transfer
   * @throws BadRequestException
   */

  private async _validateInternalTransfer({
    fromUserId,
    amount,
    manager,
    toUserId,
  }: {
    toUserId: string;
    fromUserId: string;
    amount: number;
    manager: EntityManager;
  }) {
    if (fromUserId === toUserId) {
      throw new BadRequestException(errorMsgs.transactionInternalYourSelf);
    }

    if (amount < this._minInternalTransactionLimit) {
      throw new BadRequestException(
        `${errorMsgs.transactionInternalMinLimitError} ${convertCentsToDollars(
          this._minInternalTransactionLimit,
        )}`,
      );
    }

    if (amount > this._maxInternalTransactionLimit) {
      throw new BadRequestException(
        `${errorMsgs.transactionInternalMaxLimitError} ${convertCentsToDollars(
          this._maxInternalTransactionLimit,
        )}`,
      );
    }

    const balance = await this.accountStatementsService.getBalanceTransactional(
      { userId: fromUserId, manager },
    );

    if (balance < amount) {
      throw new BadRequestException(errorMsgs.insufficientBalance);
    }
  }

  /**
   * Send a confirmation code to create an internal transaction
   * @param data data to send a confirmation code
   * @returns result
   */

  async sendInternalTransactionCode(data: ISendInternalTransactionCode) {
    const { amount, fromUserId, toUserId } = data;
    const { email } = await this.usersService.findOneOrFail({ id: fromUserId });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      await this._validateInternalTransfer({
        amount,
        fromUserId,
        toUserId,
        manager: queryRunner.manager,
      });

      const code = generateCode(this._codeLength);
      await queryRunner.manager.insert(TransactionCode, {
        userId: fromUserId,
        code,
      });
      await this.mailService.internalTransactionCode({
        email,
        code,
        amount: Number(convertCentsToDollars(amount)),
        userId: toUserId,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.transactionInternalSendCodeError}
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
   * Create an internal transaction
   * @param data data to create an internal transaction
   * @returns internal transaction
   */

  async createInternalTransaction(data: ICreateInternalTransaction) {
    const { amount, fromUserId, code, toUserId } = data;

    const outgoingTransactionType =
      await this.transactionTypesService.findOneOrFail({
        name: TransactionTypeEnum.internalTransferOutgoing,
      });
    const incomingTransactionType =
      await this.transactionTypesService.findOneOrFail({
        name: TransactionTypeEnum.internalTransferIncoming,
      });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    const { manager } = queryRunner;

    let originTransactionId: string;

    try {
      await this.transactionCodesService.validate({
        code,
        manager,
        userId: fromUserId,
      });
      await this._validateInternalTransfer({
        amount,
        fromUserId,
        toUserId,
        manager,
      });

      originTransactionId = (
        await manager.insert(Transaction, {
          userId: fromUserId,
          amount,
          typeId: outgoingTransactionType.id,
        })
      ).identifiers[0].id;
      const receiptTransaction = manager.create(Transaction, {
        userId: toUserId,
        amount,
        typeId: incomingTransactionType.id,
        originTransactionId,
      });
      await manager.save(Transaction, receiptTransaction);

      await manager.update(
        TransactionCode,
        {
          userId: fromUserId,
          code,
        },
        { transactionId: originTransactionId },
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.transactionInternalSendCodeError}
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

    return await this.repository.findOne({
      where: { id: originTransactionId },
    });
  }

  /**
   * Returns the amount of transactions
   * @param data data to get the amount
   * @returns amount
   */

  public async getTransactionsAmount({
    userId,
    afterDate,
    beforeDate,
    manager,
    transactionTypeName,
  }: IGetTransactionsAmount) {
    const query = manager
      .getRepository(Transaction)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.type', 'transactionType')
      .select('SUM(transaction.amount)', 'stringSum')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transactionType.name = :transactionTypeName', {
        transactionTypeName,
      });

    if (afterDate) {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate,
      });
    } else {
      query.andWhere('transaction.createdAt >= :afterDate', {
        afterDate: moment().startOf('month').toDate(),
      });
    }

    if (beforeDate) {
      query.andWhere('transaction.createdAt <= :beforeDate', {
        beforeDate,
      });
    }

    const { stringSum }: { stringSum: string } = await query.getRawOne();
    return !stringSum ? 0 : parseInt(stringSum, 10);
  }
}
