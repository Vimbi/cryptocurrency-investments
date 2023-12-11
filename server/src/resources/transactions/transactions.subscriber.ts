import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  TransactionCommitEvent,
} from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Injectable, Logger } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Injectable()
@EventSubscriber()
export class TransactionSubscriber
  implements EntitySubscriberInterface<Transaction>
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionsService: TransactionsService,
    private readonly logger: Logger,
  ) {
    this.dataSource.subscribers.push(this);
  }
  /**
   * Indicates that this subscriber only listen to Post events.
   */
  listenTo() {
    return Transaction;
  }

  /**
   * Called after entity insertion.
   */
  afterInsert(event: InsertEvent<Transaction>) {
    event.queryRunner.data.transaction = event.entity;
  }

  async afterTransactionCommit(event: TransactionCommitEvent) {
    try {
      if (event.queryRunner.data.transaction) {
        await this.transactionsService.afterTransactionCommitInsert(
          event.queryRunner.data.transaction,
        );
      }
    } catch (error) {
      this.logger.error(error.message, error.stack, TransactionSubscriber.name);
    }
  }
}
