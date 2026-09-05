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
import { PropertiesService, PropertyFilterQuery } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

function toBool(v: unknown): boolean | undefined {
  return v === 'true' || v === '1' ? true : v === 'false' || v === '0' ? false : undefined;
}

@Controller('properties')
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  @UseGuards(AdminGuard)
  @Get('admin')
  adminList() {
    return this.properties.adminList();
  }

  @Public()
  @Get()
  list(
    @Query('q') q?: string,
    @Query('assetClass') assetClass?: string,
    @Query('area') area?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('status') status?: string,
    @Query('offMarket') offMarket?: string,
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const query: PropertyFilterQuery = {
      q,
      assetClass,
      area,
      status,
      offMarket: toBool(offMarket),
      featured: toBool(featured),
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    };
    return this.properties.list(query);
  }

  @Public()
  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.properties.getBySlug(slug);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreatePropertyDto) {
    return this.properties.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.properties.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.properties.remove(id);
  }
}