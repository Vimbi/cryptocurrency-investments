import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaffleLocaleContent } from './entities/raffle-locale-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RaffleLocaleContent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class RafflesLocaleContentModule {}
