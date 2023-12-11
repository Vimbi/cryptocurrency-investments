import { Logger, Module } from '@nestjs/common';
import { TronscanService } from './tronscan.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  providers: [TronscanService, Logger],
  exports: [TronscanService],
})
export class TronscanModule {}
