import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateSalonMaterialDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsBoolean()
    isUsed?: boolean; // Material the salon USES

    @IsOptional()
    @IsBoolean()
    isSold?: boolean; // Material the salon SELLS/HAS

    @IsOptional()
    @IsNumber()
    price?: number; // Price if sold
}
