import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ASSET_CLASSES, AREAS, PROPERTY_STATUSES } from '../../common/domain/enums';

export class CurationFilterDto {
  @IsOptional()
  @IsIn(ASSET_CLASSES)
  assetClass?: string;

  @IsOptional()
  @IsIn(AREAS)
  area?: string;

  @IsOptional()
  @IsBoolean()
  offMarket?: boolean;

  @IsOptional()
  @IsIn(PROPERTY_STATUSES)
  status?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class CreateCurationDto {
  @IsString()
  title!: string;

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