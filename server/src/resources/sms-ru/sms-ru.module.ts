import { Module } from '@nestjs/common';
import { SMSRuService } from './sms-ru.service';
import { HttpModule } from '@nestjs/axios';
import { Logger } from '@nestjs/common';

@Module({
  imports: [HttpModule.register({})],
  providers: [SMSRuService, Logger],
  exports: [SMSRuService],
})
export class SMSRUModule {}
