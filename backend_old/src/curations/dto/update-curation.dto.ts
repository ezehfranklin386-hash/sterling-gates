import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CurationFilterDto } from './create-curation.dto';

export class UpdateCurationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CurationFilterDto)
  filter?: CurationFilterDto;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}