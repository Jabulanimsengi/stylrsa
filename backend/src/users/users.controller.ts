import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSellerPlanDto } from './dto/update-seller-plan.dto';

@UseGuards(JwtGuard)
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get('me')
  getProfile(@GetUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(@GetUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/seller-plan')
  updateSellerPlan(@GetUser() user: any, @Body() dto: UpdateSellerPlanDto) {
    return this.usersService.updateSellerPlan(user.id, dto);
  }

  @Patch('me/seller-profile')
  saveDraftSellerProfile(@GetUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.saveDraftSellerProfile(user.id, dto);
  }

  @Post('me/seller-profile/submit')
  submitSellerProfile(@GetUser() user: any) {
    return this.usersService.submitSellerProfile(user.id);
  }
}
