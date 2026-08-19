import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @MaxLength(160)
  title!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200_000)
  body?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}