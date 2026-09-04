import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient(request?: Request) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof cookies === 'function') {
            try {
              return cookies().get(name)?.value;
            } catch {
              // Fallback for non-server components
            }
          }
          // Fallback for raw Request objects
          if (request) {
            return request.headers.get('cookie')?.match(new RegExp(`(^| )${name}=([^;]+)`))?.[2];
          }
          return undefined;
        },
      },
    }
  );
}
