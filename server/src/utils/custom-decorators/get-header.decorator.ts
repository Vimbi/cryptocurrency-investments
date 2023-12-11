import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetHeader = createParamDecorator(
  async (data, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest().headers;
    if (!data) return headers;
    return headers[data];
  },
);
