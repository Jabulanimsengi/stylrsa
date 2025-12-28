// backend/src/bookings/dto/create-booking.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  bookingTime: string;

  @IsBoolean()
  isMobile: boolean;

  @IsString()
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

  @IsString()
  @IsOptional()
  materialSelection?: string; // For braiding/hairpiece services: selected material

  // Payment-related fields
  @IsBoolean()
  @IsOptional()
  depositPaid?: boolean; // Whether 60% deposit is paid

  @IsBoolean()
  @IsOptional()
  useCashback?: boolean; // Whether to use cashback balance

  @IsNumber()
  @Min(0)
  @IsOptional()
  cashbackUsed?: number; // Amount of cashback to apply
}
