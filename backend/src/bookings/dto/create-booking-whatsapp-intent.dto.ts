import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateBookingWhatsAppIntentDto {
  @IsString()
  @IsNotEmpty()
  salonId: string;

  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  bookingTime: string;

  @IsString()
  @IsNotEmpty()
  clientFirstName: string;

  @IsString()
  @IsNotEmpty()
  clientLastName: string;

  @IsString()
  @Matches(/^0[0-9]{9}$/, { message: 'Phone number must be a valid South African number (10 digits starting with 0)' })
  clientPhone: string;

  @IsBoolean()
  @IsOptional()
  isMobile?: boolean;

  @IsString()
  @IsOptional()
  teamMemberId?: string;

  @IsString()
  @IsOptional()
  clientNotes?: string;

  @IsString()
  @IsOptional()
  colorSelection?: string;

  @IsString()
  @IsOptional()
  materialSelection?: string;

  @IsNumber()
  @Min(0)
  totalCost: number;

  @IsNumber()
  @Min(0)
  depositAmount: number;
}
