import { Logger, Module } from '@nestjs/common';
import { EtherScanService } from './ether-scan.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  providers: [EtherScanService, Logger],
  exports: [EtherScanService],
})
export class EtherScanModule {}
