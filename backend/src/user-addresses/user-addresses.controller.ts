import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserAddressesService } from './user-addresses.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';

@Controller('user-addresses')
@UseGuards(JwtGuard)
export class UserAddressesController {
    constructor(private readonly userAddressesService: UserAddressesService) { }

    @Get()
    findAll(@Request() req: any) {
        return this.userAddressesService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.userAddressesService.findOne(req.user.id, id);
    }

    @Post()
    create(@Request() req: any, @Body() createDto: CreateUserAddressDto) {
        return this.userAddressesService.create(req.user.id, createDto);
    }

    @Put(':id')
    update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateDto: UpdateUserAddressDto,
    ) {
        return this.userAddressesService.update(req.user.id, id, updateDto);
    }

    @Put(':id/set-default')
    setDefault(@Request() req: any, @Param('id') id: string) {
        return this.userAddressesService.setDefault(req.user.id, id);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.userAddressesService.remove(req.user.id, id);
    }
}
