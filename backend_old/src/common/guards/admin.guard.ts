import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Authorisation guard (must run after AuthGuard has set req.user, which the
 * global register order guarantees). Resolves the authoritative role from the
 * `app_users` row rather than a JWT claim, so role changes propagate
 * immediately (docs/03 §5).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const uid: string | undefined = request.user?.uid;
    if (!uid) throw new ForbiddenException('Administrator access required');

    this.supabase.require();
    const { data, error } = await this.supabase
      .from('app_users')!
      .select('id, role, active')
      .eq('id', uid)
      .maybeSingle();
    if (error) throw error;
    const row = data as Record<string, unknown> | null;
    if (!row || row.role !== 'admin' || row.active !== true) {
      throw new ForbiddenException('Administrator access required');
    }
    return true;
  }
}