import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { JwtGuard } from '../auth/guard/jwt.guard';

@Controller('api/sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) { }

  @Get('stats')
  @UseGuards(JwtGuard)
  getStats(
    @Request() req: any,
    @Query('period') period?: 'week' | 'month' | 'year',
  ) {
    return this.sellersService.getStats(req.user.id, period || 'month');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellersService.findById(id);
  }
}
