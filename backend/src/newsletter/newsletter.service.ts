import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  private readonly hits = new Map<string, number[]>();

  constructor(private readonly supabase: SupabaseService) {}

  private table() {
    return this.supabase.from('subscribers');
  }

  /** Simple in-memory rate limit: max 5 requests per email per minute. */
  private assertNotThrottled(key: string): void {
    const now = Date.now();
    const window = now - 60_000;
    const recent = (this.hits.get(key) ?? []).filter((t) => t > window);
    if (recent.length >= 5) {
      throw new HttpException('Too many subscription attempts', HttpStatus.TOO_MANY_REQUESTS);
    }
    recent.push(now);
    this.hits.set(key, recent);
  }

  async subscribe(dto: SubscribeDto) {
    this.supabase.require();
    const email = dto.email.trim().toLowerCase();
    this.assertNotThrottled(email);

    const { data: existing } = await this.table()!.select('*').eq('email', email);
    if (existing && existing.length) {
      const doc: any = existing[0];
      if (doc.status !== 'active') {
        await this.table()!
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', doc.id);
      }
      return { subscribed: true };
    }
    const { error } = await this.table()!.insert({
      email,
      status: 'active',
      source: 'web',
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    return { subscribed: true };
  }

  async adminList() {
    if (!this.supabase.configured) return [];
    const { data, error } = await this.table()!.select('*').order('created_at', {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r));
  }

  async remove(id: string) {
    this.supabase.require();
    const { data: row, error } = await this.table()!.select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!row) throw new NotFoundException('Subscriber not found');
    const { data: updated } = await this.table()!
      .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    return this.supabase.snakeToCamel<any>(updated);
  }
}