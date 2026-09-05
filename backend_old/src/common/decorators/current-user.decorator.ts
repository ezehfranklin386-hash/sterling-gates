import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from './current-user.types';

/**
 * Injects the authenticated user object (`{ uid, email }`) set by AuthGuard.
 * `@CurrentUser('uid')` returns just the uid.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    return data && user ? user[data] : user;
  },
);