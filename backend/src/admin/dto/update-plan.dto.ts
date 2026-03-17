import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export type PlanCode = 'FREE' | 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE' | 'PREMIUM';

export class UpdatePlanDto {
  @IsOptional()
  @IsIn(['FREE', 'STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE', 'PREMIUM'])
  planCode?: PlanCode;

  @IsOptional()
  @IsNumber()
  visibilityWeight?: number;

  @IsOptional()
  @IsNumber()
  maxListings?: number;
}
