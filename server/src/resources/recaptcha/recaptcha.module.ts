import { Logger, Module } from '@nestjs/common';
import { RecaptchaService } from './recaptcha.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  providers: [Logger, RecaptchaService],
  exports: [RecaptchaService],
})
export class RecaptchaModule {}
