import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * Singleton access to Supabase (Postgres + Storage) via the service-role key.
 * The service role bypasses Row-Level Security, so it is the only write path
 * to the database (mirrors the previous Firebase Admin-SDK-only approach).
 */
@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}