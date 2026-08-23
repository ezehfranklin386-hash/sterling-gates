// Supabase client SDK init (anon key — public role only). The SPA uses the
// admin sign-in to obtain a session access token, then exchanges it at
// POST /api/auth/login for the backend's app JWT. All reads and writes go
// through the NestJS API; Supabase never talks to Postgres directly here.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If env vars are missing (e.g. not configured yet), don't crash at import
// time — only the admin sign-in path needs them.
const configured = Boolean(url && anon);

let client: SupabaseClient | null = null;

function ensure(): SupabaseClient {
  if (client) return client;
  if (!configured) {
    throw new Error(
      'Supabase is not configured. Copy frontend/.env.example to frontend/.env ' +
        'and fill in your Supabase project credentials.',
    );
  }
  client = createClient(url!, anon!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Lazily-initialised Supabase Auth handle (admin sign-in only). */
export function getConfiguredAuth(): SupabaseClient {
  return ensure();
}

/** True when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set. */
export const supabaseConfigured = configured;