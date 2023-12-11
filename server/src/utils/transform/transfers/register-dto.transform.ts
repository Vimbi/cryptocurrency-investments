import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { AuthRegisterLoginDto } from '../../../resources/auth/dto/auth-register-login.dto';

@Injectable()
export class RegisterDtoTransform implements PipeTransform {
  async transform(dto: AuthRegisterLoginDto, _metadata: ArgumentMetadata) {
    // const { phone } = dto;

    // dto.phone = phone.replace(/[^\d]/g, '');

    return dto;
  }
}
