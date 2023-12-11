import { Logger, Module } from '@nestjs/common';
import { BtcScanService } from './btc-scan.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  providers: [BtcScanService, Logger],
  exports: [BtcScanService],
})
export class BtcScanModule {}
