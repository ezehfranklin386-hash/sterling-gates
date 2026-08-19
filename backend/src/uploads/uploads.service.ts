import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { SupabaseService } from '../common/supabase/supabase.service';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

@Injectable()
export class UploadsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  async upload(file: Express.Multer.File): Promise<{ url: string }> {
    this.supabase.require();
    const client = this.supabase.sb;
    if (!client) {
      throw new BadRequestException('Storage is not configured');
    }
    const mime = file?.mimetype;
    const ext = ALLOWED.get(mime ?? '');
    if (!ext) {
      throw new BadRequestException('Unsupported file type (jpeg / png / webp only)');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('File exceeds the maximum size of 5 MB');
    }
    const bucket = this.config.get('SUPABASE_STORAGE_BUCKET') ?? 'images';
    const path = `${randomUUID()}.${ext}`;
    const { error } = await client.storage
      .from(bucket)
      .upload(path, file.buffer, { contentType: mime, upsert: false });
    if (error) throw error;
    const { data } = client.storage
      .from(bucket)
      .getPublicUrl(path);
    const url = data.publicUrl;
    return { url };
  }
}