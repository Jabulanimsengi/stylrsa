import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { VideoShortsService } from './video-shorts.service';
import { CreateVideoShortDto } from './dto/create-video-short.dto';
import { UpdateVideoShortDto } from './dto/update-video-short.dto';

@Controller('video-shorts')
export class VideoShortsController {
    constructor(private readonly videoShortsService: VideoShortsService) { }

    // Public: Get video shorts for a salon profile
    @Get('salon/:salonId')
    findBySalon(
        @Param('salonId') salonId: string,
        @Query('limit') limit?: string,
    ) {
        return this.videoShortsService.findBySalon(salonId, limit ? parseInt(limit, 10) : 20);
    }

    // Public: Increment view count
    @Post(':id/view')
    incrementView(@Param('id') id: string) {
        return this.videoShortsService.incrementView(id);
    }

    // Owner: Get own video shorts
    @Get('my-shorts')
    @UseGuards(JwtGuard)
    findOwn(@Request() req: any) {
        return this.videoShortsService.findByOwner(req.user.id);
    }

    // Owner: Create video short
    @Post()
    @UseGuards(JwtGuard)
    create(@Request() req: any, @Body() createDto: CreateVideoShortDto) {
        return this.videoShortsService.create(req.user.id, createDto);
    }

    // Owner: Update video short
    @Put(':id')
    @UseGuards(JwtGuard)
    update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateDto: UpdateVideoShortDto,
    ) {
        return this.videoShortsService.update(req.user.id, id, updateDto);
    }

    // Owner: Delete video short
    @Delete(':id')
    @UseGuards(JwtGuard)
    remove(@Request() req: any, @Param('id') id: string) {
        return this.videoShortsService.remove(req.user.id, id);
    }
}
