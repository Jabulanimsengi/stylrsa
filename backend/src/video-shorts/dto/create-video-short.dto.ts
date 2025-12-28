import { IsString, IsOptional } from 'class-validator';

export class CreateVideoShortDto {
    @IsString()
    videoUrl: string;

    @IsOptional()
    @IsString()
    thumbnailUrl?: string;

    @IsOptional()
    @IsString()
    caption?: string;
}
