import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreateAdvisorDto } from './dto/create-advisor.dto';
import { UpdateAdvisorDto } from './dto/update-advisor.dto';

@Injectable()
export class AdvisorsService {
  constructor(private readonly supabase: SupabaseService) {}

  private table() {
    return this.supabase.from('advisors');
  }

  async publicList() {
    if (!this.supabase.configured) return { items: [] };
    const { data, error } = await this.table()!
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return { items: (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r)) };
  }

  async adminList() {
    if (!this.supabase.configured) return [];
    const { data, error } = await this.table()!.select('*').order('sort_order', {
      ascending: true,
    });
    if (error) throw error;
    return (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r));
  }

  async create(dto: CreateAdvisorDto) {
    this.supabase.require();
    const now = new Date().toISOString();
    const body = this.supabase.camelToSnake<Record<string, unknown>>(dto as unknown as Record<string, unknown>);
    delete body.created_at;
    delete body.updated_at;
    const { data, error } = await this.table()!
      .insert({
        ...body,
        focus: dto.focus ?? [],
        sort_order: dto.sortOrder ?? 0,
        published: dto.published ?? false,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();
    if (error) throw error;
    return this.supabase.snakeToCamel<any>(data);
  }

  async update(id: string, dto: UpdateAdvisorDto) {
    this.supabase.require();
    const row = await this.getByIdInternal(id);
    if (!row) throw new NotFoundException('Advisor not found');
    const body = this.supabase.camelToSnake<Record<string, unknown>>(dto as unknown as Record<string, unknown>);
    delete body.created_at;
    delete body.updated_at;
    const { data, error } = await this.table()!
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return this.supabase.snakeToCamel<any>(data);
  }

  async remove(id: string) {
    this.supabase.require();
    const row = await this.getByIdInternal(id);
    if (!row) throw new NotFoundException('Advisor not found');
    const { error } = await this.table()!.delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }

  private async getByIdInternal(id: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.table()!.select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as Record<string, unknown>) ?? null;
  }

  private async getById(id: string) {
    const row = await this.getByIdInternal(id);
    return this.supabase.snakeToCamel<any>(row ?? {});
  }
}