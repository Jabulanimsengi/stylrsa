import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSalonPlanDto {
  @IsOptional()
  @IsString()
  @IsIn(['PREMIUM'])
  planCode?: 'PREMIUM';

  @IsOptional()
  @IsBoolean()
  hasSentProof?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  paymentReference?: string | null;
}
