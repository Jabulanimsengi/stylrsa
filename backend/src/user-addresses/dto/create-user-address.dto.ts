import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateUserAddressDto {
    @IsOptional()
    @IsString()
    label?: string; // HOME, WORK, OTHER

    @IsString()
    address: string;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
