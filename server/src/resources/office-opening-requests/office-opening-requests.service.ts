import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { IsNull, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { commonMsgs } from '../../shared/messages';
import { GetQueryDto } from '../../types/get-query.dto';
import { MailService } from '../mail/mail.service';
import { CreateOfficeOpeningRequestDto } from './dto/create-office-opening-request.dto';
import { OfficeOpeningRequest } from './entities/office-opening-request.entity';

@Injectable()
export class OfficeOpeningRequestsService {
  constructor(
    @InjectRepository(OfficeOpeningRequest)
    private repository: Repository<OfficeOpeningRequest>,
    private mailService: MailService,
    private configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
    private logger: Logger,
  ) {}

  /**
   * Create new OfficeOpeningRequest
   * @param dto data to create OfficeOpeningRequest
   * @returns created OfficeOpeningRequest
   */

  async create(dto: CreateOfficeOpeningRequestDto) {
    const { email, phone } = dto;
    const requestByEmail = await this.repository.findOneBy({ email });
    const requestByPhone = await this.repository.findOneBy({ phone });
    if (requestByEmail || requestByPhone) {
      return {
        result: true,
        message: commonMsgs.officeOpeningRequestDuplicate,
      };
    }
    await this.repository.insert(dto);
    this.notify(dto);
  }

  /**
   * Returns array of OfficeOpeningRequests
   * @param dto find options
   * @returns array of OfficeOpeningRequests
   */

  async find(dto: GetQueryDto) {
    const { sort, page, limit } = dto;
    const skip = (page - 1) * limit;
    const query = this.repository.createQueryBuilder('officeOpeningRequest');
    if (sort) {
      sort.forEach((sortBy) =>
        query.addOrderBy(
          `officeOpeningRequest.${sortBy[0]}`,
          sortBy[1].toUpperCase() as 'DESC' | 'ASC',
        ),
      );
    } else {
      query.orderBy('officeOpeningRequest.createdAt', 'DESC');
    }

    const [entities, itemCount] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return { entities, limit, page, itemCount };
  }

  /**
   * Delete OfficeOpeningRequests
   * @param ids OfficeOpeningRequests ids
   * @returns void
   */

  async delete(ids: string[]) {
    await this.repository
      .createQueryBuilder('officeOpeningRequest')
      .delete()
      .from(OfficeOpeningRequest)
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  /**
   * Notifies the client and the administrator about the creation of a request for opening an office and makes a dated note about it
   * @param data data to notify
   */

  async notify(data: CreateOfficeOpeningRequestDto) {
    const { email } = data;
    try {
      await this.mailService.officeOpeningRequest(data);
      await this.repository.update({ email }, { notifiedAt: new Date() });
    } catch (error) {
      this.logger.error(`${errorMsgs.officeOpeningRequestNotify}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  /**
   * Notifies the clients and the administrator about the creation of a requests for placing a catalog of equipment and makes a dated note about it
   */

  private async _notifyOfficeOpeningRequests() {
    const requests = await this.repository.find({
      where: { notifiedAt: IsNull() },
    });
    for (const request of requests) {
      await this.notify(request);
    }
  }

  async onModuleInit() {
    if (this.configService.get('app.officeOpeningRequestsNotifyCron')) {
      const job = new CronJob(
        this.configService.get('app.officeOpeningRequestsNotifyCron'),
        async () => await this._notifyOfficeOpeningRequests(),
      );
      this.schedulerRegistry.addCronJob(
        `${this._notifyOfficeOpeningRequests.name}`,
        job,
      );
      job.start();
    }
  }
}
