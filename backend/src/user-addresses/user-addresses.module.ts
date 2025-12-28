import { Module } from '@nestjs/common';
import { UserAddressesController } from './user-addresses.controller';
import { UserAddressesService } from './user-addresses.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [UserAddressesController],
    providers: [UserAddressesService],
    exports: [UserAddressesService],
})
export class UserAddressesModule { }
