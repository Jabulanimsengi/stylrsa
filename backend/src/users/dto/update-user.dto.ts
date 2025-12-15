import { IsOptional, IsString, IsNotEmpty, IsArray } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  // Seller profile fields (for PRODUCT_SELLER users)
  @IsString()
  @IsOptional()
  sellerWhatsapp?: string;

  @IsString()
  @IsOptional()
  sellerWebsite?: string;

  @IsString()
  @IsOptional()
  sellerBankName?: string;

  @IsString()
  @IsOptional()
  sellerBankAccountHolder?: string;

  @IsString()
  @IsOptional()
  sellerBankAccountNumber?: string;

  @IsString()
  @IsOptional()
  sellerBankBranchCode?: string;

  @IsString()
  @IsOptional()
  sellerBankAccountType?: string;

  @IsString()
  @IsOptional()
  sellerPaymentNote?: string;

  // Seller business profile fields
  @IsString()
  @IsOptional()
  sellerBusinessName?: string;

  @IsString()
  @IsOptional()
  sellerContactPerson?: string;

  @IsString()
  @IsOptional()
  sellerContactPhone?: string;

  @IsString()
  @IsOptional()
  sellerContactEmail?: string;

  @IsString()
  @IsOptional()
  sellerPhysicalAddress?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sellerProvincesServed?: string[];
}
