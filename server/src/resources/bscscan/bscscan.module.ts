import { Logger, Module } from '@nestjs/common';
import { BscscanService } from './bscscan.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  providers: [BscscanService, Logger],
  exports: [BscscanService],
})
export class BscscanModule {}
