// Admin session/access-token storage (localStorage). Kept small and explicit.
// The accessToken from POST /api/auth/login is attached to every admin API
// call; it is short-lived.

import type { AuthSession } from './types';

const KEY = 'sterli
