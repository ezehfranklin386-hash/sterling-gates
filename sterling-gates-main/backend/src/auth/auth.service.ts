import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../common/supabase/supabase.service';
import { LoginDto } from './dto/login.dto';

export interface AdminProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Verify a client Supabase access token and mint the same short-lived app
   * JWT the frontend already sends as a Bearer token on admin routes.
   */
  async login(dto: LoginDto): Promise<{
    accessToken: string;
    user: { uid: string; email: string; role: 'admin' };
  }> {
    this.supabase.require();
    const client = this.supabase.sb!;

    const { data, error } = await client.auth.getUser(dto.accessToken);
    if (error || !data?.user) {
      throw new UnauthorizedException('Invalid Supabase session token');
    }
    const uid = data.user.id;

    const { data: row } = await client
      .from('app_users')
      .select('id, email, name, role, active')
      .eq('id', uid)
      .maybeSingle();
    if (!row || (row as any).role !== 'admin' || (row as any).active !== true) {
      throw new ForbiddenException('Access requires admin role');
    }
    const email = (data.user.email ?? (row as any).email ?? '') as string;

    const accessToken = await this.jwt.signAsync({
      uid,
      role: 'admin',
      email,
    });
    return {
      accessToken,
      user: { uid, email, role: 'admin' },
    };
  }

  /** GET /auth/me — profile for the current admin (from the app_users row). */
  async me(uid: string): Promise<AdminProfile> {
    this.supabase.require();
    const { data, error } = await this.supabase
      .from('app_users')!
      .select('id, email, name, role, active')
      .eq('id', uid)
      .maybeSingle();
    if (error) throw error;
    const row = data as Record<string, unknown> | null;
    if (!row || row.role !== 'admin' || row.active !== true) {
      throw new ForbiddenException('Access requires admin role');
    }
    return {
      uid,
      email: (row.email as string) ?? '',
      name: (row.name as string) ?? '',
      role: 'admin',
    };
  }
}