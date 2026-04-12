// backend/src/services/services.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { SetServiceDiscountDto } from './dto/set-service-discount.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guard/optional-jwt.guard';

@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser() user: any, @Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(user, createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('approved')
  findAllApproved(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @GetUser() user: any,
  ) {
    return this.servicesService.findAllApproved(page, pageSize, user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('search')
  search(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('categoryId') categoryId?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('sortBy') sortBy?: string,
    @Query('limit') limit?: string,
    @GetUser() user?: any,
  ) {
    return this.servicesService.search({
      q,
      category,
      categoryId,
      priceMin,
      priceMax,
      province,
      city,
      sortBy,
      limit: limit ? parseInt(limit, 10) : 100,
    }, user);
  }

  @Get('autocomplete')
  autocomplete(@Query('q') q: string) {
    return this.servicesService.autocomplete(q);
  }

  @Get('salon/:salonId')
  findAllForSalon(@Param('salonId') salonId: string) {
    return this.servicesService.findAllForSalon(salonId);
  }

  @Get('featured')
  findFeatured() {
    return this.servicesService.findFeatured();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(user, id, updateServiceDto);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/discount')
  setDiscount(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() setServiceDiscountDto: SetServiceDiscountDto,
  ) {
    return this.servicesService.setDiscount(user, id, setServiceDiscountDto.discountPercentage);
  }

  @UseGuards(JwtGuard)
  @Delete(':id/discount')
  clearDiscount(@GetUser() user: any, @Param('id') id: string) {
    return this.servicesService.clearDiscount(user, id);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.servicesService.remove(user, id);
  }
}
