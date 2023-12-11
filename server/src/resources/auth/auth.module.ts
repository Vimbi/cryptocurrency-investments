import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { ForgotModule } from '../forgot/forgot.module';
import { MailModule } from '../mail/mail.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { UserStatusesModule } from '../user-statuses/user-statuses.module';
import { SMSRUModule } from '../sms-ru/sms-ru.module';
import { JwtTwoFactorStrategy } from './strategies/jwt-two-factor.strategy';
import { RecaptchaModule } from '../recaptcha/recaptcha.module';

@Module({
  imports: [
    ForgotModule,
    JwtModule.register({}),
    MailModule,
    PassportModule,
    RecaptchaModule,
    RolesModule,
    SMSRUModule,
    UsersModule,
    UserStatusesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    Logger,
    JwtTwoFactorStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
