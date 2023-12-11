import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaffleFile } from './entities/raffle-file.entity';
import { RaffleFilesService } from './raffle-files.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaffleFile])],
  controllers: [],
  providers: [RaffleFilesService],
  exports: [RaffleFilesService],
})
export class RaffleFilesModule {}
