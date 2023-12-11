import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ForgotModule } from '../forgot/forgot.module';
import { RolesModule } from '../roles/roles.module';
import { UserStatusesModule } from '../user-statuses/user-statuses.module';
import { InvestmentsModule } from '../investments/investments.module';

@Module({
  imports: [
    InvestmentsModule,
    ForgotModule,
    TypeOrmModule.forFeature([User]),
    RolesModule,
    UserStatusesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, Logger],
  exports: [UsersService],
})
export class UsersModule {}
