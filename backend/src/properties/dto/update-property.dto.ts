import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ASSET_CLASSES,
  AREAS,
  PROPERTY_STATUSES,
  AssetClass,
  Area,
  PropertyStatus,
} from '../../common/domain/enums';
import { SizeDto } from './create-property.dto';

/** Partial property update — every field optional and whitelisted. */
export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsIn(ASSET_CLASSES)
  assetClass?: AssetClass;

  @IsOptional()
  @IsIn(AREAS)
  area?: Area;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SizeDto)
  size?: SizeDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsIn(PROPERTY_STATUSES)
  status?: PropertyStatus;

  @IsOptional()
  @IsBoolean()
  offMarket?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  assetReference?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  @IsUrl()
  heroImageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}