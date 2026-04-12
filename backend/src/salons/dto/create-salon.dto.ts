import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  IsUrl,
  MaxLength,
  IsPhoneNumber,
  IsLatitude,
  IsLongitude,
  IsBoolean,
  IsIn,
  IsEmail,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class OperatingHoursDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsString()
  @IsNotEmpty()
  open: string;

  @IsString()
  @IsNotEmpty()
  close: string;
}

export class CreateSalonDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  town: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  province: string;

  @IsString()
  @IsNotEmpty()
  // Relaxed validation: accepts various SA phone formats
  // +27 XX XXX XXXX, 0XX XXX XXXX, etc.
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @IsOptional()
  @IsUrl()
  tiktokUrl?: string;

  @IsOptional()
  @IsUrl()
  googleReviewsUrl?: string;

  @IsOptional()
  @IsUrl()
  freshaReviewsUrl?: string;

  @IsOptional()
  @IsUrl()
  booksyReviewsUrl?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHoursDto)
  operatingHours?: OperatingHoursDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return undefined;
    const cleaned = value
      .filter((item) => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim());
    return cleaned.length > 0 ? cleaned : undefined;
  })
  operatingDays?: string[];

  @IsOptional()
  @IsBoolean()
  offersMobile?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mobileFee?: number;

  @IsOptional()
  @IsString()
  @IsIn(['ONSITE', 'MOBILE', 'BOTH'])
  bookingType?: string;

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

  @IsOptional()
  @IsBoolean()
  adminConfirmEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  accountHolder?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  accountNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  branchCode?: string | null;

  @IsOptional()
  @IsBoolean()
  depositRequired?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  depositPercentage?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  paymentInstructions?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellationPolicy?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialConditions?: string | null;
}
