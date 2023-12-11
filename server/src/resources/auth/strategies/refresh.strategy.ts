import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { errorMsgs } from '../../../shared/error-messages';
import { IJwtPayload } from '../../../types/jwt-payload.interface';
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.secretRefreshToken'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IJwtPayload) {
    const refreshToken = req.cookies?.refresh;
    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    const user = await this.userService.findOne({ id: payload.id });
    if (!user) {
      throw new NotFoundException(errorMsgs.userNotFound);
    }
    if (user.deletedAt) {
      throw new UnauthorizedException(errorMsgs.userDeleted);
    }
    if (!user.isTwoFactorAuthenticationEnabled) {
      return payload;
    }
    if (payload.isSecondFactorAuthenticated) {
      return payload;
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
