import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule],
  providers: [MailService, Logger],
  exports: [MailService],
})
export class MailModule {}
