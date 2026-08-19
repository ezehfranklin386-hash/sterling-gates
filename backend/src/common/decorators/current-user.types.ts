/** Shape of the authenticated user attached to the request by AuthGuard. */
export interface AuthUser {
  uid: string;
  email: string;
  role?: string;
}