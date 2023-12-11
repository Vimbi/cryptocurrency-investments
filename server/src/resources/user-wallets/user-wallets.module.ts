import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWallet } from './entities/user-wallet.entity';
import { UserWalletsController } from './user-wallets.controller';
import { UserWalletsService } from './user-wallets.service';
import { NetworksModule } from '../networks/networks.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserWallet]), NetworksModule],
  controllers: [UserWalletsController],
  providers: [UserWalletsService],
  exports: [UserWalletsService],
})
export class UserWalletsModule {}
