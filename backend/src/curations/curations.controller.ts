import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurationsService } from './curations.service';
import { CreateCurationDto } from './dto/create-curation.dto';
import { UpdateCurationDto } from './dto/update-curation.dto';

@Controller('curations')
export class CurationsController {
  constructor(private readonly curations: CurationsService) {}

  @UseGuards(AdminGuard)
  @Get('admin')
  adminList() {
    return this.curations.adminList();
  }

  @Public()
  @Get()
  list() {
    return this.curations.list();
  }

  @Public()
  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.curations.getBySlug(slug);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateCurationDto) {
    return this.curations.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCurationDto) {
    return this.curations.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curations.remove(id);
  }
}