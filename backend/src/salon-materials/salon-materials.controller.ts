import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { SalonMaterialsService } from './salon-materials.service';
import { CreateSalonMaterialDto } from './dto/create-salon-material.dto';
import { UpdateSalonMaterialDto } from './dto/update-salon-material.dto';

@Controller('salon-materials')
export class SalonMaterialsController {
    constructor(private readonly salonMaterialsService: SalonMaterialsService) { }

    // Public: Get materials for a salon profile
    @Get('salon/:salonId')
    findBySalon(@Param('salonId') salonId: string) {
        return this.salonMaterialsService.findBySalon(salonId);
    }

    // Owner: Get own materials
    @Get('my-materials')
    @UseGuards(JwtGuard)
    findOwn(@Request() req: any) {
        return this.salonMaterialsService.findByOwner(req.user.id);
    }

    // Owner: Create material
    @Post()
    @UseGuards(JwtGuard)
    create(@Request() req: any, @Body() createDto: CreateSalonMaterialDto) {
        return this.salonMaterialsService.create(req.user.id, createDto);
    }

    // Owner: Update material
    @Put(':id')
    @UseGuards(JwtGuard)
    update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateDto: UpdateSalonMaterialDto,
    ) {
        return this.salonMaterialsService.update(req.user.id, id, updateDto);
    }

    // Owner: Delete material
    @Delete(':id')
    @UseGuards(JwtGuard)
    remove(@Request() req: any, @Param('id') id: string) {
        return this.salonMaterialsService.remove(req.user.id, id);
    }
}
