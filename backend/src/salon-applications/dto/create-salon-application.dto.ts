import {
  IsArray,
  IsBoolean,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

export class CreateSalonApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  salonName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contactPersonName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  email: string;

  @IsString()
  @Matches(/^0[0-9]{9}$/, {
    message:
      'Phone number must be a valid South African number (10 digits starting with 0)',
  })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @Matches(/^0[0-9]{9}$/, {
    message:
      'WhatsApp number must be a valid South African number (10 digits starting with 0)',
  })
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

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

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

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

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bankName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  accountHolder: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  accountNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  branchCode?: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  priceListFileUrl: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  bankingProofFileUrl: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  portfolioImageUrls?: string[];
}
