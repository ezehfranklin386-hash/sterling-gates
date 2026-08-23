import { Module } from '@nestjs/common';
import { CurationsController } from './curations.controller';
import { CurationsService } from './curations.service';

@Module({
  controllers: [CurationsController],
  providers: [CurationsService],
})
export class CurationsModule {}