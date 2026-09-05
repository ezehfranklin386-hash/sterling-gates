import { IsString } from 'class-validator';

export class LoginDto {
  /** A Supabase access token from `supabase.auth.signInWithPassword`. */
  @IsString()
  accessToken!: string;
}