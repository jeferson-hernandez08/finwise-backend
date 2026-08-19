import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // 'userId' se asigna en JwtStrategy (validate retorna { userId, email })
    return request.user?.userId || request.user?.sub;
  },
);