import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { Public } from '../common/decorators/public.decorator';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateEnquiryDto) {
    return this.enquiries.create(dto);
  }

  @UseGuards(AdminGuard)
  @Get()
  list(@Query('status') status?: string) {
    return this.enquiries.list(status);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  mark(@Param('id') id: string, @Body() dto: UpdateEnquiryDto) {
    return this.enquiries.markFollowedUp(id, dto);
  }
}