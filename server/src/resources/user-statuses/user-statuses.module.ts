import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStatus } from './entities/user-status.entity';
import { UserStatusesController } from './user-statuses.controller';
import { UserStatusesService } from './user-statuses.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserStatus])],
  controllers: [UserStatusesController],
  providers: [UserStatusesService],
  exports: [UserStatusesService],
})
export class UserStatusesModule {}
