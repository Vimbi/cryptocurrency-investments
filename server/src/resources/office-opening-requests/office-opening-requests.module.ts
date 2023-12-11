import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { OfficeOpeningRequest } from './entities/office-opening-request.entity';
import { OfficeOpeningRequestsController } from './office-opening-requests.controller';
import { OfficeOpeningRequestsService } from './office-opening-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([OfficeOpeningRequest]), MailModule],
  controllers: [OfficeOpeningRequestsController],
  providers: [OfficeOpeningRequestsService, Logger],
  exports: [OfficeOpeningRequestsService],
})
export class OfficeOpeningRequestsModule {}
