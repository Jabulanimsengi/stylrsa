import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateSalonApplicationDto } from './dto/create-salon-application.dto';
import { SalonApplicationsService } from './salon-applications.service';

@Controller('api/salon-applications')
export class SalonApplicationsController {
  constructor(
    private readonly salonApplicationsService: SalonApplicationsService,
  ) {}

  @Post()
  create(@Body() dto: CreateSalonApplicationDto) {
    return this.salonApplicationsService.create(dto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 })
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @Query('kind')
    kind: 'price-list' | 'banking-proof' | 'portfolio' = 'portfolio',
  ) {
    const normalizedKind =
      kind === 'price-list' || kind === 'banking-proof' || kind === 'portfolio'
        ? kind
        : 'portfolio';
    return this.salonApplicationsService.uploadDocument(file, normalizedKind);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salonApplicationsService.findOneOrThrow(id);
  }
}
