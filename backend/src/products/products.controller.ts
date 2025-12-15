import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser() user: any, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(user, createProductDto);
  }

  @Get()
  findAllApproved(
    @Query('category') category?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('q') search?: string,
    @Query('inStock') inStock?: string,
  ) {
    return this.productsService.findAllApproved({
      category,
      priceMin,
      priceMax,
      search,
      inStock,
    });
  }

  // IMPORTANT: Specific routes must come BEFORE parameterized routes!
  @UseGuards(JwtGuard)
  @Get('my-products')
  findMyProducts(@GetUser() user: any) {
    return this.productsService.findMyProducts(user);
  }

  @UseGuards(JwtGuard)
  @Get('seller/:sellerId')
  findProductsForSeller(
    @GetUser() user: any,
    @Param('sellerId') sellerId: string,
  ) {
    return this.productsService.findProductsForSeller(user, sellerId);
  }

  // Parameterized route comes AFTER specific routes
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(user, id, updateProductDto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.productsService.remove(user, id);
  }
}
