import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworksService } from './networks.service';
import { NetworksController } from './networks.controller';
import { Network } from './entities/network.entity';
import { TransferStatusesModule } from '../transfer-statuses/transfer-statuses.module';

@Module({
  imports: [TypeOrmModule.forFeature([Network]), TransferStatusesModule],
  controllers: [NetworksController],
  providers: [NetworksService],
  exports: [NetworksService],
})
export class NetworksModule {}
