import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CompleteClientOnboardingDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @MinLength(10, { message: 'Phone number must be at least 10 digits long' })
  @IsNotEmpty()
  phoneNumber: string;
}
