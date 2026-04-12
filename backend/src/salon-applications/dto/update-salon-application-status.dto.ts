import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSalonApplicationStatusDto {
  @IsString()
  @IsIn(['UNDER_REVIEW', 'CHANGES_REQUESTED', 'REJECTED'])
  status: 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'REJECTED';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}
