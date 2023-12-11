import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralLevelsService } from './referral-levels.service';
import { ReferralLevelsController } from './referral-levels.controller';
import { ReferralLevel } from './entities/referral-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReferralLevel])],
  controllers: [ReferralLevelsController],
  providers: [ReferralLevelsService],
  exports: [ReferralLevelsService],
})
export class ReferralLevelsModule {}
