export interface AuthUser {
  id: string;
  email: string;
  role: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
}

export interface AuthenticatedUser extends AuthUser {
  is_admin?: boolean;
}
