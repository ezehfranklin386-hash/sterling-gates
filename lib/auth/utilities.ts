import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AuthUser } from './types';

/**
 * Gets the current authenticated user from the request.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  const supabase = createServerSupabaseClient(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    role: user.role,
    app_metadata: user.app_metadata,
    user_metadata: user.user_metadata,
  };
}

/**
 * Requires authentication. Throws 401 error if not authenticated.
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await getCurrentUser(request);

  if (!user) {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    throw error;
  }

  return user;
}

/**
 * Requires admin authentication. Throws 401 if not authenticated,
 * or 403 if authenticated but not admin.
 */
export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await requireAuth(request);
  const supabase = createServerSupabaseClient(request);

  const { data: userData, error } = await supabase
    .from('app_users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (error || !userData?.is_admin) {
    const error = new Error('Forbidden - Admin access required');
    (error as any).status = 403;
    throw error;
  }

  return { ...user, is_admin: true };
}
