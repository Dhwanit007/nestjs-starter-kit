import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../user.entity';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext): User | undefined => {
    const request = context.switchToHttp().getRequest<Request>();
    //@ts-expect-error custom property added in request
    return request.user as User | undefined;
  },
);
