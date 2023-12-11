import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forgot } from './entities/forgot.entity';
import { ForgotService } from './forgot.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Forgot])],
  providers: [ForgotService, Logger],
  exports: [ForgotService],
})
export class ForgotModule {}
