import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/utilities';

/**
 * Get current user endpoint - returns authenticated user data
 * 
 * @param request - HTTP request
 * @returns User data if authenticated, 401 if not
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth/me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
