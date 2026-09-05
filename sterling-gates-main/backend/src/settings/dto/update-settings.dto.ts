import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  contactPhoneLabel?: string;

  @IsEmail()
  @IsOptional()
  adminEmail?: string;

  @IsBoolean()
  @IsOptional()
  emailsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  whatsappEnabled?: boolean;
}