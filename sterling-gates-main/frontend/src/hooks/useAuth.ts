// Auth hook for the admin panel. Sign-in flow (docs/frontend-spec.md §5):
// Supabase email/password sign-in → get a fresh access token → exchange it at
// POST /api/auth/login for the app's short-lived accessToken. The backend is
// authoritative for admin role.

import { useCallback, useEffect, useState } from 'react';
import { getConfiguredAuth } from '../lib/supabase';
import { api } from '../lib/api';
import { clearSession, loadSession, saveSession } from '../lib/session';
import type { AuthSession } from '../lib/types';

interface UseAuth {
  user: { uid: string; email: string } | null;
  admin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuth {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const admin = session?.user?.role === 'admin';
  const user = session?.user ?? null;

  useEffect(() => {
    const stored = loadSession();
    if (stored) setSession(stored);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const sb = getConfiguredAuth();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        throw new SupabaseAuthError(error.message);
      }
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        throw new SupabaseAuthError('No session returned from Supabase.');
      }
      const next = await api.login(accessToken);
      saveSession(next);
      setSession(next);
    } catch (e) {
      const msg =
        e instanceof SupabaseAuthError
          ? e.message
          : 'Sign-in failed. Please try again.';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    clearSession();
    setSession(null);
    try {
      const sb = getConfiguredAuth();
      await sb.auth.signOut();
    } catch {
      /* session is already cleared locally */
    }
  }, []);

  return { user, admin, loading, error, signIn, signOut };
}

class SupabaseAuthError extends Error {}