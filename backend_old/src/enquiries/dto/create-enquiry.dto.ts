import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ARCHETYPES } from '../../common/domain/enums';

export class CreateEnquiryDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsIn(ARCHETYPES)
  archetype!: string;

  @IsString()
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsString()
  propertySlug?: string;
}