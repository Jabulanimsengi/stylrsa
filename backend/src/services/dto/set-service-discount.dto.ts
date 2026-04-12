import { IsNumber, Max, Min } from 'class-validator';

export class SetServiceDiscountDto {
  @IsNumber()
  @Min(1)
  @Max(95)
  discountPercentage: number;
}
