import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Thin wrapper around the Supabase JS client using the **service role** key.
 *
 * Credentials are read from env at boot when both `SUPABASE_URL` and
 * `SUPABASE_SERVICE_ROLE_KEY` are present. If either is missing the app still
 * boots with `configured === false`: public reads return empty and
 * guarded/write routes throw 503. This keeps local boot green before
 * credentials are supplied.
 *
 * Row helpers convert PostgREST snake_case rows to the camelCase API contract
 * (only top-level column names are converted; JSONB values pass through).
 */
@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client?: SupabaseClient;
  configured = false;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const serviceKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (url && serviceKey) {
      this.client = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      this.configured = true;
      this.logger.log('Supabase client initialised (service role).');
    } else {
      this.logger.warn(
        'Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing). ' +
          'Public reads will return empty until credentials are provided.',
      );
    }
  }

  /** The raw Supabase client (service role). Undefined when unconfigured. */
  get sb(): SupabaseClient | undefined {
    return this.client;
  }

  /** A PostgREST query builder for a table, or undefined when unconfigured. */
  from(table: string) {
    return this.client?.from(table);
  }

  /** Throw a chained 503 whenever Supabase is required but not configured. */
  require(): void {
    if (!this.configured || !this.client) {
      throw new ServiceUnavailableException(
        'Service unavailable: Supabase is not configured on the backend.',
      );
    }
  }

  /** snake_case row → camelCase API row (top-level keys only). */
  snakeToCamel<T>(row: Record<string, unknown> | null | undefined): Record<string, unknown> {
    if (!row) return {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      out[toCamel(k)] = v;
    }
    return out;
  }

  /** camelCase API object → snake_case insert/update (top-level keys only). */
  camelToSnake<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) continue;
      out[toSnake(k)] = v;
    }
    return out;
  }
}

function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}