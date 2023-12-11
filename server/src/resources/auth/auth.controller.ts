import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { User } from '../users/entities/user.entity';
import { AuthLoginDto } from './dto/auth-login.dto';
import { GetUser } from '../../utils/custom-decorators/get-user.decorator';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { RegisterDtoTransform } from '../../utils/transform/transfers/register-dto.transform';
import { JwtTwoFactorGuard } from './guards/jwt-two-factor.guard';
import { AuthEmailResendDto } from './dto/auth-email-resend.dto';
import { AuthEmailChangeDto } from './dto/auth-email-change.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(public service: AuthService) {}

  @Post('login/password')
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        user: {
          $ref: getSchemaPath(User),
        },
        token: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  public async login(@Body() loginDto: AuthLoginDto) {
    return this.service.validateLogin(loginDto);
  }

  @Post('resend-confirm-email')
  public async resend(@Body() dto: AuthEmailResendDto) {
    return this.service.resendEmailConfirm(dto);
  }

  @Post('register')
  public async register(
    @Body(RegisterDtoTransform) createUserDto: AuthRegisterLoginDto,
  ) {
    return this.service.register(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  public async refreshTokens(
    @GetUser('id') userId: string,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return await this.service.refreshTokens(userId, refreshToken);
  }

  @ApiExcludeEndpoint()
  @Redirect()
  @Get('email/confirm/:hash')
  async confirmEmail(@Param('hash') hash: string) {
    return { url: await this.service.confirmEmail(hash) };
  }

  @ApiExcludeEndpoint()
  @Redirect()
  @Get('email/change/:hash')
  async confirmEmailChange(@Param('hash') hash: string) {
    return { url: await this.service.confirmEmailChange(hash) };
  }

  // @ApiExcludeEndpoint()
  // @Redirect()
  // @Get('email/change/cancel/:hash')
  // async cancelEmailChange(@Param('hash') hash: string) {
  //   return { url: await this.service.cancelEmailChange(hash) };
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Post('2fa/authenticate')
  // public async twoFactorAuthentication(
  //   @GetUser('id') userId: string,
  //   @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  // ) {
  //   return await this.service.twoFactorAuthentication({
  //     userId,
  //     code: twoFactorAuthenticationCode,
  //   });
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Post('2fa/turn-on')
  // @ApiResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       result: { type: 'boolean' },
  //     },
  //   },
  // })
  // public async turnOnTwoFactorAuthentication(
  //   @GetUser('id') userId: string,
  //   @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  // ) {
  //   return await this.service.turnOnTwoFactorAuthentication({
  //     userId,
  //     twoFactorAuthenticationCode,
  //   });
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtTwoFactorGuard)
  // @Post('2fa/turn-off')
  // @ApiResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       result: { type: 'boolean' },
  //     },
  //   },
  // })
  // public async turnOffTwoFactorAuthentication(
  //   @GetUser('id') userId: string,
  //   @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  // ) {
  //   return await this.service.turnOffTwoFactorAuthentication({
  //     userId,
  //     twoFactorAuthenticationCode,
  //   });
  // }

  @Post('forgot/password')
  public async forgotPassword(@Body() { email }: AuthForgotPasswordDto) {
    return this.service.forgotPassword(email);
  }

  @Post('reset/password')
  public async changePasswordConfirm(@Body() body: AuthResetPasswordDto) {
    return this.service.resetPassword(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtTwoFactorGuard)
  @Get('me')
  @ApiResponse({ type: User })
  public async me(@GetUser('id') userId: string) {
    return await this.service.me(userId);
  }

  @ApiBearerAuth()
  @Patch('me')
  @UseGuards(JwtTwoFactorGuard)
  @ApiResponse({ type: User })
  public async update(
    @GetUser('id') userId: string,
    @Body() userDto: AuthUpdateDto,
  ) {
    return await this.service.update(userId, userDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtTwoFactorGuard)
  @Patch('me/change-email')
  async changeEmail(
    @GetUser('id') id: string,
    @Body() dto: AuthEmailChangeDto,
  ) {
    return this.service.changeEmail(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtTwoFactorGuard)
  @Patch('me/change-password')
  public async changePassword(
    @GetUser('id') userId: string,
    @Body() { oldPassword, newPassword }: AuthChangePasswordDto,
  ) {
    return this.service.changePassword({ userId, oldPassword, newPassword });
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(JwtTwoFactorGuard)
  public async delete(@GetUser('id') userId: string) {
    return this.service.softDelete(userId);
  }
}
