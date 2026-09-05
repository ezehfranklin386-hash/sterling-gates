import { createServerClient } from '@supabase/ssr';

export function createServerSupabaseClient(request?: Request) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request?.headers.get('cookie')
            ?.match(new RegExp(`(^| )${name}=([^;]+)`))?.[2];
        },
      },
    }
  );
}
