import { IsIn } from 'class-validator';

export class UpdateEnquiryDto {
  @IsIn(['new', 'followed_up'])
  status!: 'new' | 'followed_up';
}