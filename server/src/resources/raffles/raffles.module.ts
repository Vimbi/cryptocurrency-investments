import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RafflesService } from './raffles.service';
import { RafflesController } from './raffles.controller';
import { UsersModule } from '../users/users.module';
import { Raffle } from './entities/raffle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Raffle]), UsersModule],
  controllers: [RafflesController],
  providers: [RafflesService, Logger],
  exports: [RafflesService],
})
export class RafflesModule {}
