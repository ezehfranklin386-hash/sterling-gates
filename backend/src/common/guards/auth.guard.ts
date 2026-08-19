import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { AuthUser } from '../decorators/auth-user.types';
import { IS_PUBLIC_KEY } from './is-public.metadata';

/**
 * Global guard. Verifies the app JWT in `Authorization: Bearer <token>`
 * (minted at `/auth/login`) and attaches `req.user = { uid, email }`.
 * Routes marked @Public() are skipped.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers?.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = header.substring(7).trim();
    try {
      const payload = await this.jwt.verifyAsync<{ uid: string; email?: string }>(token);
      const user: AuthUser = { uid: payload.uid, email: payload.email ?? '' };
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}