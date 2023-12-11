import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqBody = createParamDecorator(
  async (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user.id;

    return {
      ...request.body,
      userId,
    };
  },
);
