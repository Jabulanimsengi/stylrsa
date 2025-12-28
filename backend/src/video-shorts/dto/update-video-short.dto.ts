import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoShortDto } from './create-video-short.dto';

export class UpdateVideoShortDto extends PartialType(CreateVideoShortDto) { }
