import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

/**
 * Liveness probe. Works with no Supabase credentials so the backend can be
 * confirmed booting before configuration is supplied.
 */
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): { ok: true } {
    return { ok: true };
  }
}