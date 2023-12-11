import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from '../../../types/jwt-payload.interface';
import { errorMsgs } from '../../../shared/error-messages';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.secret'),
    });
  }

  public async validate(payload: IJwtPayload) {
    if (!payload.id) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({ id: payload.id });
    if (!user) {
      throw new NotFoundException(errorMsgs.userNotFound);
    }
    if (user.deletedAt) {
      throw new UnauthorizedException(errorMsgs.userDeleted);
    }

    return payload;
  }
}
