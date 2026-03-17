// backend/src/bookings/dto/create-booking.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  Matches,
} from 'class-validator';

export enum MaterialSelection {
  HAVE_OWN = 'HAVE_OWN',
  BUY_SALON = 'BUY_SALON',
  BUY_PLATFORM = 'BUY_PLATFORM',
}

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  bookingTime: string;

  @IsBoolean()
  @IsNotEmpty()
  isMobile: boolean;

  @IsString()
  @Matches(/^0[0-9]{9}$/, { message: 'Phone number must be a valid South African number (10 digits starting with 0)' })
  @IsOptional()
  clientPhone?: string;

  @IsString()
  @IsOptional()
  teamMemberId?: string; // Optional: selected professional/stylist

  @IsString()
  @IsOptional()
  clientNotes?: string; // Optional: notes/preferences for the appointment

  // New booking customization fields
  @IsString()
  @IsOptional()
  colorSelection?: string; // For nail services: selected color

  @IsEnum(MaterialSelection)
  @IsOptional()
  materialSelection?: MaterialSelection; // For braiding/hairpiece services: selected material

  // Payment-related fields
  @IsBoolean()
  @IsOptional()
  depositPaid?: boolean; // Whether the 50% deposit is paid
}
