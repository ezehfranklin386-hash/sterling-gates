import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const GLOBAL_ID = 1;

export interface PublicSettings {
  contactPhone: string;
  contactPhoneLabel: string;
  whatsappLink?: string;
  adminEmail?: string;
  emailsEnabled?: boolean;
  whatsappEnabled?: boolean;
}

export interface AdminSettings extends PublicSettings {}

@Injectable()
export class SettingsService {
  constructor(private readonly supabase: SupabaseService) {}

  /** Keep only digits — WhatsApp numbers must be intl/national without + or spaces. */
  private normalizePhone(raw?: string): string {
    return (raw ?? '').replace(/[^\d]/g, '');
  }

  private async getRaw(): Promise<Record<string, unknown> | undefined> {
    if (!this.supabase.configured) return undefined;
    const { data, error } = await this.supabase
      .from('settings')!
      .select('*')
      .eq('id', GLOBAL_ID)
      .maybeSingle();
    if (error) throw error;
    return data ? (this.supabase.snakeToCamel<Record<string, unknown>>(data as Record<string, unknown>) as Record<string, unknown>) : undefined;
  }

  /** GET /settings (public) — normalised phone + wa.me link + admin email. */
  async publicSettings(): Promise<PublicSettings> {
    const s = await this.getRaw();
    const contactPhone = this.normalizePhone(s?.contactPhone as string | undefined);
    return {
      contactPhone,
      contactPhoneLabel: (s?.contactPhoneLabel as string) ?? '',
      whatsappLink: contactPhone ? https://wa.me/ : undefined,
      adminEmail: (s?.adminEmail as string) ?? undefined,
      emailsEnabled: s?.emailsEnabled as boolean,
      whatsappEnabled: s?.whatsappEnabled as boolean,
    };
  }

  /** PUT /settings (admin) — persist and return the full admin shape. */
  async update(dto: UpdateSettingsDto): Promise<AdminSettings> {
    this.supabase.require();
    const { error } = await this.supabase
      .from('settings')!
      .update({ ...this.supabase.camelToSnake<Record<string, unknown>>(dto as any), updated_at: new Date().toISOString() })
      .eq('id', GLOBAL_ID);
    if (error) throw error;
    const s = await this.getRaw();
    const contactPhone = this.normalizePhone(s?.contactPhone as string | undefined);
    return {
      contactPhone,
      contactPhoneLabel: (s?.contactPhoneLabel as string) ?? '',
      whatsappLink: contactPhone ? https://wa.me/ : undefined,
      adminEmail: s?.adminEmail as string,
      emailsEnabled: s?.emailsEnabled as boolean,
      whatsappEnabled: s?.whatsappEnabled as boolean,
    };
  }
}
