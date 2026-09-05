import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { Public } from '../common/decorators/public.decorator';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogs: BlogsService) {}

  @Public()
  @Get()
  list(@Query('limit') limit?: string, @Query('page') page?: string) {
    return this.blogs.list(Number(limit) || 20, Number(page) || 1);
  }

  @UseGuards(AdminGuard)
  @Get('admin')
  adminList() {
    return this.blogs.adminList();
  }

  @Public()
  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.blogs.getBySlug(slug);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateBlogDto) {
    return this.blogs.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogs.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogs.remove(id);
  }
}