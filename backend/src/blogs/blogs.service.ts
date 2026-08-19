import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { slugify } from '../common/utils/slugify';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  author: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
}

@Injectable()
export class BlogsService {
  constructor(private readonly supabase: SupabaseService) {}

  private table() {
    return this.supabase.from('blogs');
  }

  /** Public list — published only, newest first, paginated. */
  async list(limit = 20, page = 1) {
    const all = await this.allPublished();
    all.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    const items = all.slice((page - 1) * limit, page * limit);
    return { total: all.length, items };
  }

  async allPublished(): Promise<Array<Record<string, any>>> {
    if (!this.supabase.configured) return [];
    const { data, error } = await this.table()!.select('*').eq('published', true);
    if (error) throw error;
    return (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r));
  }

  /** GET /blogs/:slug — single published, full body. */
  async getBySlug(slug: string) {
    const { data, error } = await this.table()!.select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    const row: any = data;
    if (!row || row.published !== true) {
      throw new NotFoundException('Blog not found');
    }
    return this.supabase.snakeToCamel<any>(row);
  }

  /** Admin: all blogs incl. drafts. */
  async adminList() {
    if (!this.supabase.configured) return [];
    const { data, error } = await this.table()!.select('*').order('created_at', {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map((r: any) => this.supabase.snakeToCamel<any>(r));
  }

  async create(dto: CreateBlogDto) {
    this.supabase.require();
    const now = new Date().toISOString();
    const slug = dto.slug ?? slugify(dto.title);
    await this.ensureSlugFree(slug);
    const body = this.supabase.camelToSnake<Record<string, unknown>>(dto as unknown as Record<string, unknown>);
    delete body.created_at;
    delete body.updated_at;
    const row: Record<string, unknown> = {
      ...body,
      slug,
      published_at: dto.published ? now : null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await this.table()!.insert(row).select('*').single();
    if (error) throw error;
    return this.supabase.snakeToCamel<any>(data);
  }

  async update(id: string, dto: UpdateBlogDto) {
    this.supabase.require();
    const row = await this.getByIdInternal(id);
    if (!row) throw new NotFoundException('Blog not found');
    if (dto.slug && dto.slug !== (row as any).slug) await this.ensureSlugFree(dto.slug);
    const patch: Record<string, unknown> = {
      ...this.supabase.camelToSnake<Record<string, unknown>>(dto as unknown as Record<string, unknown>),
      updated_at: new Date().toISOString(),
    };
    // Set publishedAt once on the first publish.
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
    if (!row) throw new NotFoundException('Blog not found');
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