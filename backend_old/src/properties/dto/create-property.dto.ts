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

export class SizeDto {
  @IsNumber()
  @Min(0)
  value!: number;

  @IsIn(['sqm', 'sqft'])
  unit!: 'sqm' | 'sqft';
}

export class CreatePropertyDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsIn(ASSET_CLASSES)
  assetClass!: AssetClass;

  @IsIn(AREAS)
  area!: Area;

  @IsString()
  location!: string;

  @IsNumber()
  @Min(0)
  price!: number;

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

  @IsIn(PROPERTY_STATUSES)
  @IsOptional()
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