import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/is-public.metadata';

/**
 * Makes a route/controller opt out of the global AuthGuard.
 * Mark all endpoints reachable without a token (public reads, enquiries,
 * newsletter, auth) with @Public().
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);