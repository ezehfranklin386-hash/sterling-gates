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
import { AdvisorsService } from './advisors.service';
import { CreateAdvisorDto } from './dto/create-advisor.dto';
import { UpdateAdvisorDto } from './dto/update-advisor.dto';

@Controller('advisors')
export class AdvisorsController {
  constructor(private readonly advisors: AdvisorsService) {}

  @UseGuards(AdminGuard)
  @Get('admin')
  adminList() {
    return this.advisors.adminList();
  }

  @Public()
  @Get()
  list() {
    return this.advisors.publicList();
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateAdvisorDto) {
    return this.advisors.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdvisorDto) {
    return this.advisors.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.advisors.remove(id);
  }
}