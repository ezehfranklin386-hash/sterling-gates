import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';

export interface EnquiryResult {
  id: string;
  status: 'new';
  whatsappLink?: string;
  emailSent: boolean;
}

@Injectable()
export class EnquiriesService {
  private readonly logger = new Logger(EnquiriesService.name);
  private readonly mailer: nodemailer.Transporter | null;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (host && user) {
      this.mailer = nodemailer.createTransport({
        host,
        port: Number(this.config.get('SMTP_PORT') ?? 587),
        secure: Number(this.config.get('SMTP_PORT')) === 465,
        auth: { user, pass },
      });
    } else {
      this.mailer = null;
      this.logger.warn('SMTP not configured — enquiry emails are disabled.');
    }
  }

  private table() {
    return this.supabase.from('enquiries');
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** POST /enquiries — persist, email the admin, and build a wa.me link. */
  async create(dto: CreateEnquiryDto): Promise<EnquiryResult> {
    this.supabase.require();
    const body = this.supabase.camelToSnake<Record<string, unknown>>(dto as any);
    const { data, error } = await this.table()!
      .insert({
        ...body,
        status: 'new',
        source: 'web',
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;
    const id: string = (data as any).id;

    const settingsData = await this.supabase.from('settings')!.select('*').eq('id', 1).maybeSingle();
    const settingsRow = settingsData.data
      ? this.supabase.snakeToCamel<Record<string, unknown>>(settingsData.data as any)
      : {};
    const s = settingsRow;

    let emailSent = false;
    if (s?.emailsEnabled && s?.adminEmail && this.mailer) {
      emailSent = await this.sendMail(String(s.adminEmail), dto).catch((err) => {
        this.logger.error(`Enquiry email failed: ${err.message}`);
        return false;
      });
    }

    const contactPhone = String(s?.contactPhone ?? '').replace(/[^\d]/g, '');
    const whatsappLink =
      s?.whatsappEnabled !== false && contactPhone
        ? `https://wa.me/${contactPhone}?text=${encodeURIComponent(
            `Hello Sterling Gates. I'm ${dto.name} (${dto.archetype}). ${dto.message}`,
          )}`
        : undefined;

    return { id, status: 'new', whatsappLink, emailSent };
  }

  async list(status?: string) {
    this.supabase.require();
    let query = this.table()!.select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r));
  }

  async markFollowedUp(id: string, dto: UpdateEnquiryDto) {
    this.supabase.require();
    const { data: existing } = await this.table()!.select('*').eq('id', id).maybeSingle();
    if (!existing) throw new NotFoundException('Enquiry not found');
    const { data, error } = await this.table()!
      .update({ status: dto.status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return this.supabase.snakeToCamel<any>(data);
  }

  private async sendMail(to: string, dto: CreateEnquiryDto): Promise<boolean> {
    if (!this.mailer) return false;
    const from = this.config.get('SMTP_FROM') ?? 'Sterling Gates <sterlinggatesrealty@gmail.com>';
    const subject = `New Sterling Gates enquiry — ${dto.name}`;
    const text =
      `New enquiry from the Sterling Gates website.\n\n` +
      `Name: ${dto.name}\nEmail: ${dto.email}\nArchetype: ${dto.archetype}\n` +
      `Property ref: ${dto.propertySlug ?? '—'}\n\nMessage:\n${dto.message}`;
    const html =
      `<div style="font-family:Georgia,serif;color:#111B18">` +
      `<h2 style="color:#8C764D">New Sterling Gates enquiry</h2>` +
      `<p><strong>Name:</strong> ${this.escapeHtml(dto.name)}</p>` +
      `<p><strong>Email:</strong> ${this.escapeHtml(dto.email)}</p>` +
      `<p><strong>Archetype:</strong> ${this.escapeHtml(dto.archetype)}</p>` +
      `<p><strong>Property ref:</strong> ${this.escapeHtml(dto.propertySlug ?? '—')}</p>` +
      `<p><strong>Message:</strong><br/>${this.escapeHtml(dto.message).replace(/\n/g, '<br/>')}</p>` +
      `</div>`;
    await this.mailer.sendMail({ from, to, subject, text, html });
    return true;
  }
}