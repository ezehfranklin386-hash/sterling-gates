// Admin session/access-token storage (localStorage). Kept small and explicit.
// The accessToken from POST /api/auth/login is attached to every admin API
// call; it is short-lived (docs/backend-spec.md §13).

import type { AuthSession } from './types';

const KEY = 'sterling_gates_admin_session';

export function saveSession(session: AuthSession): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}

/** Access token for the current admin session, or undefined. */
export function getAccessToken(): string | undefined {
  return loadSession()?.accessToken;
}