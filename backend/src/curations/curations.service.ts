import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { slugify } from '../common/utils/slugify';
import { CreateCurationDto } from './dto/create-curation.dto';
import { UpdateCurationDto } from './dto/update-curation.dto';

@Injectable()
export class CurationsService {
  constructor(private readonly supabase: SupabaseService) {}

  private table() {
    return this.supabase.from('curations');
  }

  async list() {
    const all = await this.allPublished();
    return { items: all };
  }

  async allPublished(): Promise<any[]> {
    if (!this.supabase.configured) return [];
    const { data, error } = await this.table()!.select('*').eq('published', true);
    if (error) throw error;
    return (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r));
  }

  async getBySlug(slug: string) {
    const { data, error } = await this.table()!.select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    const row: any = data;
    if (!row || row.published !== true) throw new NotFoundException('Curation not found');
    return this.supabase.snakeToCamel<any>(row);
  }

  async adminList() {
    if (!this.supabase.configured) return [];
    const { data, error } = await this.table()!.select('*').order('created_at', {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r));
  }

  async create(dto: CreateCurationDto) {
    this.supabase.require();
    const slug = dto.slug ?? slugify(dto.title);
    await this.ensureSlugFree(slug);
    const now = new Date().toISOString();
    const body = this.supabase.camelToSnake<Record<string, unknown>>(dto as unknown as Record<string, unknown>);
    delete body.created_at;
    delete body.updated_at;
    const { data, error } = await this.table()!
      .insert({
        ...body,
        slug,
        published: dto.published ?? false,
        filter: dto.filter ?? {},
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();
    if (error) throw error;
    return this.supabase.snakeToCamel<any>(data);
  }

  async update(id: string, dto: UpdateCurationDto) {
    this.supabase.require();
    const row = await this.getByIdInternal(id);
    if (!row) throw new NotFoundException('Curation not found');
    if (dto.slug && dto.slug !== (row as any).slug) await this.ensureSlugFree(dto.slug, id);
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
    if (!row) throw new NotFoundException('Curation not found');
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

  private async ensureSlugFree(slug: string, exceptId?: string) {
    const { data, error } = await this.table()!.select('id, slug').eq('slug', slug);
    if (error) throw error;
    if (data && data.length) {
      const taken = data[0];
      if ((taken as any).id !== exceptId) {
        throw new ConflictException(`Slug "${slug}" is already in use`);
      }
    }
  }
}