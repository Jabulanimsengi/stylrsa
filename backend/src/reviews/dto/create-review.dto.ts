import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsArray,
  IsOptional,
  ArrayMaxSize,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  comment: string;

  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  images?: string[];
}
