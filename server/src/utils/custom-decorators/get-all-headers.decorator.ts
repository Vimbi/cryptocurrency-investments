import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetAllHeaders = createParamDecorator(
  async (data, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest().headers;
    return headers;
  },
);
