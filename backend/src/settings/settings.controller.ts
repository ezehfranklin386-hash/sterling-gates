import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { Public } from '../common/decorators/public.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Public()
  @Get()
  get() {
    return this.settings.publicSettings();
  }

  @UseGuards(AdminGuard)
  @Put()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}