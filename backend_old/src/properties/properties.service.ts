import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { slugify } from '../common/utils/slugify';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

export interface PropertyFilterQuery {
  q?: string;
  assetClass?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  status?: string;
  offMarket?: boolean;
  featured?: boolean;
  limit?: number;
  page?: number;
}

@Injectable()
export class PropertiesService {
  constructor(private readonly supabase: SupabaseService) {}

  private table() {
    return this.supabase.from('properties');
  }

  private async allPublished(): Promise<Array<Record<string, any>>> {
    if (!this.supabase.configured) return [];
    const { data, error } = await this.table()!.select('*').eq('published', true);
    if (error) throw error;
    return (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r));
  }

  /** GET /properties — published only, filtered + paginated. */
  async list(query: PropertyFilterQuery): Promise<{ items: any[]; total: number }> {
    const q = query || {};
    const limit = Math.max(1, Math.min(100, Number(q.limit) || 20));
    const page = Math.max(1, Number(q.page) || 1);

    const keyword = q.q?.toLowerCase();
    let all = await this.allPublished();
    all = all.filter((p: any) => {
      if (keyword) {
        const hay = [p.title, p.location, p.area, p.assetReference, p.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      if (q.assetClass && p.assetClass !== q.assetClass) return false;
      if (q.area && p.area !== q.area) return false;
      if (q.status && p.status !== q.status) return false;
      if (q.offMarket === true && p.offMarket !== true) return false;
      if (q.featured === true && p.featured !== true) return false;
      if (typeof q.priceMin === 'number' && (Number(p.price) || 0) < q.priceMin) return false;
      if (typeof q.priceMax === 'number' && (Number(p.price) || 0) > q.priceMax) return false;
      return true;
    });

    all.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    const total = all.length;
    const items = all.slice((page - 1) * limit, page * limit);
    return { items, total };
  }

  /** GET /properties/:slug — a single published listing. */
  async getBySlug(slug: string) {
    const { data, error } = await this.table()!.select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    const row: any = data;
    if (!row || row.published !== true) {
      throw new NotFoundException('Property not found');
    }
    return this.supabase.snakeToCamel<any>(row);
  }

  /** Admin — all listings incl. drafts, newest first. */
  async adminList() {
    if (!this.supabase.configured) return [];
    const { data, error } = await this.table()!.select('*').order('created_at', {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r));
  }

  async create(dto: CreatePropertyDto) {
    this.supabase.require();
    const slug = dto.slug ?? slugify(dto.title);
    await this.ensureSlugFree(slug);
    const now = new Date().toISOString();
    const row: Record<string, unknown> = {
      ...this.supabase.camelToSnake<Record<string, unknown>>(dto as unknown as Record<string, unknown>),
      slug,
      status: dto.status ?? 'available',
      off_market: dto.offMarket ?? false,
      featured: dto.featured ?? false,
      published: dto.published ?? false,
      features: dto.features ?? [],
      image_urls: dto.imageUrls ?? [],
      published_at: dto.published ? now : null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await this.table()!.insert(row).select('*').single();
    if (error) throw error;
    return this.supabase.snakeToCamel<any>(data);
  }

  async update(id: string, dto: UpdatePropertyDto) {
    this.supabase.require();
    const row = await this.getByIdInternal(id);
    if (!row) throw new NotFoundException('Property not found');
    if (dto.slug && dto.slug !== (row as any).slug) await this.ensureSlugFree(dto.slug, id);
    const patch: Record<string, unknown> = {
      ...this.supabase.camelToSnake<Record<string, unknown>>(dto as unknown as Record<string, unknown>),
      updated_at: new Date().toISOString(),
    };
    // Publish timestamp set once on first publish.
    if (dto.published === true && !(row as any).published_at) {
      patch.published_at = new Date().toISOString();
    }
    const { data, error } = await this.table()!.update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return this.supabase.snakeToCamel<any>(data);
  }

  async remove(id: string) {
    this.supabase.require();
    const row = await this.getByIdInternal(id);
    if (!row) throw new NotFoundException('Property not found');
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