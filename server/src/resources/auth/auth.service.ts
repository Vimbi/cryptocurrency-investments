import * as moment from 'moment';
import * as crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserStatusesService } from '../user-statuses/user-statuses.service';
import { ForgotService } from '../forgot/forgot.service';
import { MailService } from '../mail/mail.service';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/entities/user.entity';
import { ITokenOptions } from '../../types/token-options.interface';
import { encryptPassword } from '../../utils/encrypt-password';
import { errorMsgs } from '../../shared/error-messages';
import { UserStatusEnum } from '../user-statuses/user-status.enum';
import { RoleEnum } from '../roles/roles.enum';
import { AuthConfirmPhoneDto } from './dto/auth-confirm-phone.dto';
import { PRODUCTION } from '../../utils/constants/common-constants';
import { AuthLoginDto } from './dto/auth-login.dto';
import { SMSRuService } from '../sms-ru/sms-ru.service';
import { AuthUserCodeValidateDto } from './dto/auth-user-code-validate.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { IChangePassword } from '../../types/auth/change-password.interface';
import { IJwtPayload } from '../../types/jwt-payload.interface';
import { generateCode } from '../../utils/generate-code';
import { AuthEmailResendDto } from './dto/auth-email-resend.dto';
import { AuthEmailChangeDto } from './dto/auth-email-change.dto';
import { RecaptchaService } from '../recaptcha/recaptcha.service';

@Injectable()
export class AuthService {
  _authSecret: string;
  _authExpiresIn: string;
  _codeLifespan: number;
  _frontendDomain: string;
  _hashExpiresIn: string;
  _nodeEnv: string;
  _smsCodeLength: number;
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
    private forgotService: ForgotService,
    private jwtService: JwtService,
    private logger: Logger,
    private mailService: MailService,
    private readonly recaptchaService: RecaptchaService,
    private rolesService: RolesService,
    private smsRuService: SMSRuService,
    private usersService: UsersService,
    private userStatusesService: UserStatusesService,
  ) {
    this._authSecret = this.configService.get('auth.secret');
    this._authExpiresIn = this.configService.get('auth.expires');
    this._frontendDomain = this.configService.get('app.frontendDomain');
    this._codeLifespan = this.configService.get('auth.codeLifespan');
    this._hashExpiresIn = this.configService.get('auth.hashExpires');
    this._smsCodeLength = this.configService.get('auth.smsCodeLength');
    this._nodeEnv = this.configService.get('app.nodeEnv');
  }

  /**
   * Create tokens
   * @param user User
   * @return tokens
   */

  private _createTokens(user: User, isSecondFactorAuthenticated = false) {
    const jwtPayload: IJwtPayload = {
      id: user.id,
      role: user.role,
      isSecondFactorAuthenticated,
    };
    const tokenOptions: ITokenOptions = {
      secret: this._authSecret,
      expiresIn: this._authExpiresIn,
    };
    const refreshTokenOptions: ITokenOptions = {
      secret: this.configService.get('auth.secretRefreshToken'),
      expiresIn: this.configService.get('auth.refreshTokenExpires'),
    };
    const token = this.jwtService.sign(jwtPayload, tokenOptions);
    const refreshToken = this.jwtService.sign(jwtPayload, refreshTokenOptions);
    return {
      token,
      refreshToken,
    };
  }

  /**
   * Update refresh token hash
   * @param userId User id
   * @param refreshToken refresh token
   * @return void
   */

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await encryptPassword(refreshToken);
    await this.usersService.update({ id: userId }, { refreshToken: hash });
  }

  /**
   * Update tokens by refresh token
   * @param userId User id
   * @param refreshToken refresh token
   * @return tokens and User
   * @throws ForbiddenException if access is denied
   */

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOneLimited({ id: userId });
    if (!user || !user.refreshToken)
      throw new ForbiddenException(errorMsgs.accessDenied);

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException(errorMsgs.accessDenied);

    const tokens = this._createTokens(
      user,
      user.isTwoFactorAuthenticationEnabled,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return { ...tokens, user };
  }

  /**
   * Validate login
   * @param loginDto login dto
   * @returns token and user
   */

  async validateLogin(loginDto: AuthLoginDto) {
    const { email, recaptchaToken } = loginDto;

    if (this._nodeEnv === PRODUCTION) {
      await this.recaptchaService.verify(recaptchaToken);
    }

    const user = await this.usersService.findOneBy({
      email,
    });

    if (!user) {
      throw new UnprocessableEntityException(errorMsgs.loginError);
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (isValidPassword) {
      if (user.status.name !== UserStatusEnum.active) {
        throw new ForbiddenException(errorMsgs.emailNotVerified);
      }

      const tokens = this._createTokens(user);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      // if (user.isTwoFactorAuthenticationEnabled) {
      //   const code = generateCode(this._smsCodeLength);
      //   await this.usersService.systemUpdate(
      //     { phone },
      //     { code, codeSendedAt: new Date() },
      //   );
      //   if (this._nodeEnv !== PRODUCTION) {
      //     return { ...tokens, code };
      //   } else if (this._nodeEnv === PRODUCTION) {
      //     await this.smsRuService.sendSms({
      //       to: phone,
      //       msg: `Нефрит. Код подтверждения: ${code}. Не сообщайте никому!`,
      //     });

      //     return { ...tokens };
      //   }
      // }

      const userLimitInfo = await this.usersService.findOneLimited({
        email,
      });

      return { ...tokens, user: userLimitInfo };
    } else {
      throw new UnprocessableEntityException(errorMsgs.loginError);
    }
  }

  /**
   * Create user, send confirm email
   * @param data data to create User
   * @return void
   */

  async register(data: AuthRegisterLoginDto) {
    const { email, referralCode } = data;
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const role = await this.rolesService.findOneBy({
      name: RoleEnum.user,
    });

    const status = await this.userStatusesService.findOneBy({
      name: UserStatusEnum.inactive,
    });

    const parentUser = await this.usersService.findOneBy({ referralCode });
    const parentId = parentUser?.id;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.usersService.createTransaction({
        ...data,
        roleId: role.id,
        statusId: status.id,
        entityManager: queryRunner.manager,
        hash,
        parentId,
      });

      await this.mailService.userSignUp({
        to: email,
        hash,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.userCreateError}
      Message: ${error.message}
      Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.userCreateError);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Sends a confirmation email
   * @param dto data to send confirmation email
   * @returns void
   */

  async resendEmailConfirm(dto: AuthEmailResendDto) {
    const user = await this.usersService.findOne({ email: dto.email });

    if (user) {
      const hash = crypto
        .createHash('sha256')
        .update(randomStringGenerator())
        .digest('hex');

      await this.usersService.update({ id: user.id }, { hash });
      await this.mailService.userSignUp({
        to: user.email,
        hash,
      });
    } else {
      throw new NotFoundException(errorMsgs.userNotFound);
    }
  }

  /**
   * Confirm created user
   * @param hash hash sent by mail
   * @return redirect to main page
   * @throws NotFoundException if user not found
   */

  async confirmEmail(hash: string) {
    const user = await this.usersService.findOne({
      hash,
    });

    if (user) {
      const activeStatus = await this.userStatusesService.findOneBy({
        name: UserStatusEnum.active,
      });

      await this.usersService.update(
        { id: user.id },
        {
          hash: null,
          status: activeStatus,
        },
      );
      // this.mailService.registrationCompleted(user.email);
    }

    return `${this._frontendDomain}/login`;
  }

  /**
   * Confirm created user
   * @param data data to confirm phone
   * @return frontend domain
   * @throws NotFoundException if user not found
   */

  async confirmPhone({ userId, code }: AuthConfirmPhoneDto) {
    const user = await this.usersService.findOne({
      id: userId,
      code,
      codeSendedAt: MoreThanOrEqual(
        moment().subtract(this._codeLifespan, 'minutes').toDate(),
      ),
    });

    if (!user) {
      throw new NotFoundException(errorMsgs.userNotFound);
    }

    const activeStatus = await this.userStatusesService.findOneBy({
      name: UserStatusEnum.active,
    });

    await this.usersService.systemUpdate(
      { id: user.id },
      {
        code: null,
        statusId: activeStatus.id,
      },
    );
    return { result: true };
  }

  /**
   * Sends a confirmation phone
   * @param dto data to send confirmation phone
   * @returns user id
   */

  async resendPhoneConfirm(phone: string) {
    const user = await this.usersService.findOne({ phone });

    if (user) {
      const { id, codeSendedAt } = user;
      if (
        codeSendedAt &&
        moment(codeSendedAt).add(this._codeLifespan, 'minutes').isAfter()
      ) {
        return {
          result: false,
          message: `Повторный запрос можно отправить не раньше чем ${moment(
            user.codeSendedAt,
          )
            .add(this._codeLifespan, 'minutes')
            .toDate()}`,
          finishDate: moment(user.codeSendedAt)
            .add(this._codeLifespan, 'minutes')
            .toDate(),
        };
      } else {
        const code = generateCode(this._smsCodeLength);
        await this.usersService.systemUpdate(
          { id },
          { code, codeSendedAt: new Date() },
        );
        if (this._nodeEnv !== PRODUCTION) {
          return { code, userId: id };
        }
        await this.smsRuService.sendSms({
          to: phone,
          msg: `Нефрит. Код подтверждения: ${code}. Не сообщайте никому!`,
        });
        return { userId: id };
      }
    } else {
      throw new NotFoundException(errorMsgs.userNotFound);
    }
  }

  /**
   * Sends a link to change email
   * @param dto data to send confirmation email
   * @returns void
   */

  async changeEmail(userId: string, dto: AuthEmailChangeDto) {
    const user = await this.usersService.findOne({ id: userId });

    if (user) {
      const payload = {
        email: dto.email,
      };
      const tokenOptions: ITokenOptions = {
        secret: this._authSecret,
        expiresIn: this._authExpiresIn,
      };
      const hash = this.jwtService.sign(payload, tokenOptions);
      // await this.mailService.changeEmailNotification({
      //   currentEmail: user.email,
      //   newEmail: dto.email,
      //   hash,
      // });
      await this.mailService.changeEmailConfirm({
        currentEmail: user.email,
        newEmail: dto.email,
        hash,
      });
      await this.usersService.update({ id: user.id }, { hash });
    } else {
      throw new NotFoundException(errorMsgs.userNotFound);
    }
  }

  /**
   * Confirm email change
   * @param hash hash sent by mail
   * @return redirect to main page
   * @throws NotFoundException if hash or user not found
   */

  async confirmEmailChange(hash: string) {
    await this.usersService.findOneOrFail({ hash });
    const jwtPayload: { email: string } = this.jwtService.verify(hash, {
      secret: this._authSecret,
    });
    await this.usersService.systemUpdate({ hash }, { email: jwtPayload.email });
    return this._frontendDomain;
  }

  /**
   * Cancel email change
   * @param hash hash sent by mail
   * @return redirect to main page
   * @throws NotFoundException if hash or user not found
   */

  async cancelEmailChange(hash: string) {
    await this.usersService.findOneOrFail({ hash });
    await this.usersService.update({ hash }, { hash: null });
    return this._frontendDomain;
  }

  /**
   * Create code and send it to user for change password
   * @param userId User id
   * @returns result
   */

  async changePassword({ userId, oldPassword, newPassword }: IChangePassword) {
    const user = await this.usersService.findOneOrFail({ id: userId });

    const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidOldPassword) {
      throw new UnprocessableEntityException(errorMsgs.oldPasswordIncorrect);
    }

    await this.usersService.systemUpdate(
      { id: userId },
      { password: await encryptPassword(newPassword) },
    );

    return { result: true };
  }

  /**
   * User confirmation by code
   * @param data data for confirm user
   * @returns result
   */

  async codeValidate({ code, userId }: AuthUserCodeValidateDto) {
    const user = await this.usersService.findOne({
      id: userId,
      code,
      codeSendedAt: MoreThanOrEqual(
        moment().subtract(this._codeLifespan, 'minutes').toDate(),
      ),
    });

    if (user) {
      return { result: true };
    }
    throw new UnauthorizedException(errorMsgs.codeInvalid);
  }

  /**
   * Create code and send sms to reset password
   * @param phone user phone
   * @return user id
   * @throws UnprocessableEntityException if user not found
   */

  /**
   * Create hash and send email to reset password
   * @param email user email
   * @return void
   * @throws UnprocessableEntityException if user not found
   */

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOne({
      email,
    });

    if (!user) {
      throw new UnprocessableEntityException(errorMsgs.emailNotFound);
    } else {
      const hash = crypto
        .createHash('sha256')
        .update(randomStringGenerator())
        .digest('hex');
      await this.forgotService.create({
        hash,
        user,
      });

      await this.mailService.forgotPassword({
        to: email,
        hash,
      });
    }
  }

  /**
   * Save new password
   * @param data data for reset password
   */

  async resetPassword({ hash, password }: AuthResetPasswordDto) {
    const forgot = await this.forgotService.findOneBy({
      hash,
      createdAt: MoreThanOrEqual(
        moment().subtract(this._codeLifespan, 'minutes').toDate(),
      ),
    });

    if (!forgot) {
      throw new UnprocessableEntityException(errorMsgs.linkNotValid);
    }

    const statusRole = await this.userStatusesService.findOneBy({
      name: UserStatusEnum.active,
    });

    await this.usersService.systemUpdate(
      { id: forgot.userId },
      {
        status: statusRole,
        password: await encryptPassword(password),
      },
    );
    await this.forgotService.softDelete(forgot.id);
    return this._frontendDomain;
  }

  /**
   * Returns User information
   * @param user User
   * @returns User
   */

  async me(id: string): Promise<User> {
    return await this.usersService.findOneLimited({ id });
  }

  /**
   * Updates User
   * @param id User id
   * @param userDto data to update User
   * @returns updated User
   * @throws UnprocessableEntityException if old password not found
   */

  async update(id: string, userDto: AuthUpdateDto): Promise<User> {
    await this.usersService.findOneOrFail({ id });

    await this.usersService.update({ id }, userDto);

    return await this.usersService.findOneLimited({ id });
  }

  /**
   * Removes User
   * @param id User id
   * @returns void
   */

  async softDelete(id: string): Promise<void> {
    return await this.usersService.softDelete(id);
  }

  /**
   * Sends a one time code
   * @param dto data to send a one time code
   * @returns result
   */

  async sendCode(userId: string) {
    const user = await this.usersService.findOne({ id: userId });

    if (user) {
      const { id, phone, codeSendedAt } = user;
      if (
        codeSendedAt &&
        moment(codeSendedAt).add(this._codeLifespan, 'minutes').isAfter()
      ) {
        return {
          result: false,
          message: `Повторный запрос можно отправить не раньше чем ${moment(
            user.codeSendedAt,
          )
            .add(this._codeLifespan, 'minutes')
            .toDate()}`,
          finishDate: moment(user.codeSendedAt)
            .add(this._codeLifespan, 'minutes')
            .toDate(),
        };
      } else {
        const code = generateCode(this._smsCodeLength);
        await this.usersService.systemUpdate(
          { id },
          { code, codeSendedAt: new Date() },
        );
        if (this._nodeEnv !== PRODUCTION) {
          return { code, userId: id };
        }
        await this.smsRuService.sendSms({
          to: phone,
          msg: `Нефрит. Код подтверждения: ${code}. Не сообщайте никому!`,
        });
        return { result: true };
      }
    } else {
      throw new NotFoundException(errorMsgs.userNotFound);
    }
  }

  /**
   * Enable two-factor authentication
   * @param data data to enable two-factor authentication
   * @return result
   */

  public async turnOnTwoFactorAuthentication({
    userId,
    twoFactorAuthenticationCode,
  }: {
    userId: string;
    twoFactorAuthenticationCode: string;
  }) {
    await this.codeValidate({
      code: twoFactorAuthenticationCode,
      userId,
    });
    await this.usersService.systemUpdate(
      { id: userId },
      { isTwoFactorAuthenticationEnabled: true },
    );
    return { result: true };
  }

  /**
   * Disable two-factor authentication
   * @param data data to enable two-factor authentication
   * @return result
   */

  public async turnOffTwoFactorAuthentication({
    userId,
    twoFactorAuthenticationCode,
  }: {
    userId: string;
    twoFactorAuthenticationCode: string;
  }) {
    await this.codeValidate({
      code: twoFactorAuthenticationCode,
      userId,
    });
    await this.usersService.systemUpdate(
      { id: userId },
      { isTwoFactorAuthenticationEnabled: false },
    );
    return { result: true };
  }

  /**
   *
   */

  public async twoFactorAuthentication({
    userId,
    code,
  }: {
    userId: string;
    code: string;
  }) {
    const user = await this.usersService.findOneOrFail({ id: userId });
    await this.codeValidate({ code, userId });
    const tokens = this._createTokens(user, true);
    const userLimitInfo = await this.usersService.findOneLimited({
      id: userId,
    });
    return { ...tokens, user: userLimitInfo };
  }
}
